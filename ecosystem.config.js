// PM2 yapılandırması.
//
// Tek instance ("pm2 start npm -- start") yerine cluster modu kullanıyoruz:
// bir worker büyük bir video yüklemesiyle meşgulken diğer worker'lar sayfa
// isteklerini servis etmeye devam eder. Bu, "biri video yüklerken site
// açılmıyor" sorununun temel çözümüdür.
//
// Kullanım:
//   pnpm build
//   pm2 start ecosystem.config.js
//   pm2 save          (sunucu yeniden başlatınca otomatik kalkması için bir kez)
//
// Güncelleme (yeni deploy):
//   git pull && pnpm install && pnpm build && pm2 reload ecosystem.config.js
//   (reload = sıfır kesintili yeniden yükleme)

module.exports = {
  apps: [
    {
      name: "ani-kutusu",
      // PM2 cluster modunun portu worker'lar arasında paylaşabilmesi için
      // doğrudan next binary'sini çalıştırıyoruz (npm script üzerinden değil).
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3061",
      exec_mode: "cluster",
      // CPU çekirdeği sayısı kadar worker. VPS küçükse (örn 1-2 çekirdek)
      // sabit bir sayı verebilirsiniz, örn: instances: 2
      instances: "max",
      // Bir worker bu sınırı aşarsa PM2 onu yeniden başlatır. Boyut sınırını
      // kaldırdığımız için büyük videolarda belleğin şişmesine karşı emniyet.
      // VPS RAM'inize göre ayarlayın (toplam RAM / instance sayısından düşük).
      max_memory_restart: "768M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
