<?php
/**
 * Site Footer
 */

$settingModel = new SettingModel();
$siteName = $settingModel->get('site_name', 'Kurumsal Web Sitesi');
$siteEmail = $settingModel->get('site_email', '');
$sitePhone = $settingModel->get('site_phone', '');
$siteAddress = $settingModel->get('site_address', '');

// Sosyal medya linkleri
$facebookUrl = $settingModel->get('facebook_url', '');
$twitterUrl = $settingModel->get('twitter_url', '');
$instagramUrl = $settingModel->get('instagram_url', '');
$linkedinUrl = $settingModel->get('linkedin_url', '');
?>
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3><?= escape($siteName) ?></h3>
                    <?php if ($siteAddress): ?>
                    <p><?= escape($siteAddress) ?></p>
                    <?php endif; ?>
                </div>
                
                <div class="footer-section">
                    <h4>İletişim</h4>
                    <?php if ($siteEmail): ?>
                    <p>E-posta: <a href="mailto:<?= escape($siteEmail) ?>"><?= escape($siteEmail) ?></a></p>
                    <?php endif; ?>
                    <?php if ($sitePhone): ?>
                    <p>Telefon: <a href="tel:<?= escape($sitePhone) ?>"><?= escape($sitePhone) ?></a></p>
                    <?php endif; ?>
                </div>
                
                <div class="footer-section">
                    <h4>Hızlı Linkler</h4>
                    <ul>
                        <li><a href="<?= BASE_URL ?>">Ana Sayfa</a></li>
                        <?php 
                        $pageModel = new PageModel();
                        $pages = $pageModel->getAll();
                        foreach ($pages as $page): 
                            if ($page['slug'] !== 'home'):
                        ?>
                        <li><a href="<?= BASE_URL ?>/?page=<?= escape($page['slug']) ?>"><?= escape($page['title']) ?></a></li>
                        <?php 
                            endif;
                        endforeach; 
                        ?>
                    </ul>
                </div>
                
                <?php if ($facebookUrl || $twitterUrl || $instagramUrl || $linkedinUrl): ?>
                <div class="footer-section">
                    <h4>Sosyal Medya</h4>
                    <div class="social-links">
                        <?php if ($facebookUrl): ?>
                        <a href="<?= escape($facebookUrl) ?>" target="_blank" rel="noopener">Facebook</a>
                        <?php endif; ?>
                        <?php if ($twitterUrl): ?>
                        <a href="<?= escape($twitterUrl) ?>" target="_blank" rel="noopener">Twitter</a>
                        <?php endif; ?>
                        <?php if ($instagramUrl): ?>
                        <a href="<?= escape($instagramUrl) ?>" target="_blank" rel="noopener">Instagram</a>
                        <?php endif; ?>
                        <?php if ($linkedinUrl): ?>
                        <a href="<?= escape($linkedinUrl) ?>" target="_blank" rel="noopener">LinkedIn</a>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endif; ?>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; <?= date('Y') ?> <?= escape($siteName) ?>. Tüm hakları saklıdır.</p>
            </div>
        </div>
    </footer>
    
    <!-- JavaScript -->
    <script src="<?= BASE_URL ?>/assets/js/main.js"></script>
    
    <!-- Template'inizin JS dosyalarını buraya ekleyin -->
    <!-- <script src="<?= BASE_URL ?>/assets/js/template.js"></script> -->
</body>
</html>
