<?php
function getInstagramPosts()
{
  $dir = __DIR__ . '/../cache/imgs';
  $cacheFile = $dir . '/1.jpg';

  if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 86400)) {
    return collectImages($dir);
  }

  @mkdir($dir, 0777, true);
  @chmod($dir, 0777);

  $urls = fetchInstagramApi('controlconsultoria1');
  $urls = array_slice(array_filter($urls), 0, 6);

  foreach ($urls as $i => $url) {
    $img = downloadImage($url);
    if ($img) {
      $path = $dir . '/' . ($i + 1) . '.jpg';
      @file_put_contents($path, $img);
      @chmod($path, 0666);
    }
  }

  return collectImages($dir);
}

function fetchInstagramApi($username)
{
  $ch = curl_init();
  curl_setopt_array($ch, [
    CURLOPT_URL => 'https://www.instagram.com/',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HEADER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_HTTPHEADER => [
      'User-Agent: Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
      'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    ],
  ]);
  $resp = curl_exec($ch);
  if ($resp === false) return [];
  $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
  $headers = substr($resp, 0, $headerSize);

  preg_match('/Set-Cookie:\s*csrftoken=([^;]+)/i', $headers, $m);
  $csrftoken = $m[1] ?? '';

  preg_match('/Set-Cookie:\s*mid=([^;]+)/i', $headers, $m2);
  $mid = $m2[1] ?? '';

  curl_setopt_array($ch, [
    CURLOPT_URL => "https://i.instagram.com/api/v1/users/web_profile_info/?username={$username}",
    CURLOPT_HEADER => false,
    CURLOPT_HTTPHEADER => [
      'User-Agent: Instagram 219.0.0.12.117 Android',
      'Accept: application/json',
      "X-CSRFToken: {$csrftoken}",
      "Cookie: csrftoken={$csrftoken}; mid={$mid}",
      'X-IG-App-ID: 1217981644879628',
    ],
  ]);
  $res = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

  if ($code != 200 || !$res) return [];

  $data = json_decode($res, true);
  if (!$data) return [];

  $edges = $data['data']['user']['edge_owner_to_timeline_media']['edges'] ?? [];
  $images = [];
  foreach ($edges as $e) {
    if (isset($e['node']['display_url'])) {
      $images[] = $e['node']['display_url'];
    }
  }
  return $images;
}

function downloadImage($url)
{
  $ch = curl_init();
  curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER => [
      'User-Agent: Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
      'Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Referer: https://www.instagram.com/',
    ],
  ]);
  $img = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  return ($code == 200 && $img) ? $img : null;
}

function collectImages($dir)
{
  $images = [];
  for ($i = 1; $i <= 6; $i++) {
    $path = $dir . '/' . $i . '.jpg';
    if (file_exists($path) && filesize($path) > 1000) {
      $images[] = ['id' => $i, 'url' => 'cache/imgs/' . $i . '.jpg'];
    }
  }
  return $images;
}
