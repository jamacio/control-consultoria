<?php
function getInstagramPosts()
{
  $dir = __DIR__ . '/../cache/imgs';
  @mkdir($dir, 0755, true);
  $cacheFile = $dir . '/1.jpg';
  $fresh = file_exists($cacheFile) && (time() - filemtime($cacheFile) < 86400);

  if (!$fresh) {
    $ch = curl_init();
    curl_setopt_array($ch, [
      CURLOPT_URL => 'https://i.instagram.com/api/v1/users/web_profile_info/?username=controlconsultoria1',
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_SSL_VERIFYPEER => false,
      CURLOPT_TIMEOUT => 10,
      CURLOPT_HTTPHEADER => ['User-Agent: Instagram 219.0.0.12.117 Android', 'Accept: application/json'],
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($code == 200 && $res) {
      $data = json_decode($res, true);
      if ($data && isset($data['data']['user']['edge_owner_to_timeline_media']['edges'])) {
        foreach (array_slice($data['data']['user']['edge_owner_to_timeline_media']['edges'], 0, 6) as $i => $e) {
          $ch2 = curl_init();
          curl_setopt_array($ch2, [
            CURLOPT_URL => $e['node']['display_url'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => ['User-Agent: Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36', 'Referer: https://www.instagram.com/'],
          ]);
          $img = curl_exec($ch2);
          if ($img) @file_put_contents($dir . '/' . ($i + 1) . '.jpg', $img);
        }
      }
    }
  }

  $images = [];
  for ($i = 1; $i <= 6; $i++) {
    if (file_exists($dir . '/' . $i . '.jpg')) {
      $images[] = ['id' => $i, 'url' => 'cache/imgs/' . $i . '.jpg'];
    }
  }
  return $images;
}
