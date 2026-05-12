const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = process.env.OUTPUT_DIRECTORY || './images';

console.log('🎨 Generating image gallery index...\n');

/**
 * Get all categories and their image counts
 */
function getCategoriesData() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.error(`Error: Directory ${OUTPUT_DIR} does not exist!`);
    process.exit(1);
  }
  
  const categories = [];
  const items = fs.readdirSync(OUTPUT_DIR);
  
  for (const item of items) {
    const itemPath = path.join(OUTPUT_DIR, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (imageFiles.length > 0) {
        categories.push({
          name: item,
          displayName: item.charAt(0).toUpperCase() + item.slice(1),
          count: imageFiles.length,
          images: imageFiles.slice(0, 6)
        });
      }
    }
  }
  
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Generate HTML gallery index
 */
function generateHtmlIndex(categories) {
  const totalImages = categories.reduce((sum, cat) => sum + cat.count, 0);
  
  const categoryCardsHtml = categories.map(cat => `
    <div class="category-card">
      <div class="category-preview">
        ${cat.images.map((img, idx) => `
          <img src="${cat.name}/${img}" alt="${cat.displayName}" class="preview-img preview-${idx + 1}">
        `).join('')}
      </div>
      <div class="category-info">
        <h3>${cat.displayName}</h3>
        <p class="image-count">${cat.count} images</p>
        <a href="#${cat.name}" class="view-btn">View Gallery →</a>
      </div>
    </div>
  `).join('');
  
  const gallerySectionsHtml = categories.map(cat => `
    <section id="${cat.name}" class="gallery-section">
      <h2>${cat.displayName}</h2>
      <div class="gallery-grid">
        ${fs.readdirSync(path.join(OUTPUT_DIR, cat.name))
          .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
          .map((img, idx) => `
            <div class="gallery-item">
              <img src="${cat.name}/${img}" alt="${cat.displayName} ${idx + 1}" 
                   class="gallery-img" onclick="openLightbox('${cat.name}/${img}')">
              <div class="overlay">
                <button onclick="openLightbox('${cat.name}/${img}')" class="expand-btn">🔍</button>
              </div>
            </div>
          `).join('')}
      </div>
    </section>
  `).join('');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free Wallpapers - Categorized Collection</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      color: white;
      margin-bottom: 50px;
      padding: 20px 0;
    }
    
    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    header p {
      font-size: 1.1em;
      opacity: 0.9;
    }
    
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 20px;
      padding: 15px 0;
    }
    
    .stat {
      background: rgba(255,255,255,0.2);
      padding: 10px 20px;
      border-radius: 5px;
      backdrop-filter: blur(10px);
    }
    
    .stat-number {
      font-size: 1.5em;
      font-weight: bold;
    }
    
    .stat-label {
      font-size: 0.9em;
      opacity: 0.8;
    }
    
    .categories-section {
      margin-bottom: 60px;
    }
    
    .categories-section h2 {
      text-align: center;
      color: white;
      margin-bottom: 30px;
      font-size: 2em;
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .category-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
    }
    
    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    
    .category-preview {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      overflow: hidden;
      background: #f0f0f0;
    }
    
    .preview-img {
      position: absolute;
      width: 50%;
      height: 50%;
      object-fit: cover;
    }
    
    .preview-1 { top: 0; left: 0; }
    .preview-2 { top: 0; right: 0; }
    .preview-3 { bottom: 0; left: 0; }
    .preview-4 { bottom: 0; right: 0; }
    .preview-5 { top: 25%; left: 25%; width: 33.33%; height: 50%; }
    .preview-6 { top: 25%; right: 25%; width: 33.33%; height: 50%; }
    
    .category-info {
      padding: 20px;
    }
    
    .category-info h3 {
      font-size: 1.3em;
      color: #333;
      margin-bottom: 5px;
    }
    
    .image-count {
      color: #666;
      margin-bottom: 15px;
      font-size: 0.9em;
    }
    
    .view-btn {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      transition: opacity 0.3s;
      font-weight: 500;
    }
    
    .view-btn:hover {
      opacity: 0.8;
    }
    
    .gallery-section {
      background: white;
      border-radius: 10px;
      padding: 40px 20px;
      margin-bottom: 40px;
      scroll-margin-top: 20px;
    }
    
    .gallery-section h2 {
      font-size: 1.8em;
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .gallery-item {
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      background: #f0f0f0;
      aspect-ratio: 1;
    }
    
    .gallery-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    
    .gallery-item:hover .gallery-img {
      transform: scale(1.05);
    }
    
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .gallery-item:hover .overlay {
      opacity: 1;
    }
    
    .expand-btn {
      background: white;
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 1.5em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s;
    }
    
    .expand-btn:hover {
      transform: scale(1.1);
    }
    
    .lightbox {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      animation: fadeIn 0.3s;
    }
    
    .lightbox.show {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .lightbox-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
    }
    
    .lightbox-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 40px;
      color: white;
      font-size: 2em;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.3s;
    }
    
    .lightbox-close:hover {
      opacity: 0.7;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    footer {
      text-align: center;
      color: white;
      padding: 20px;
      opacity: 0.8;
      font-size: 0.9em;
    }
    
    @media (max-width: 768px) {
      header h1 {
        font-size: 1.8em;
      }
      
      .categories-grid {
        grid-template-columns: 1fr;
      }
      
      .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
      
      .lightbox-close {
        right: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎨 Free Wallpapers</h1>
      <p>Categorized collection of beautiful images</p>
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${categories.length}</div>
          <div class="stat-label">Categories</div>
        </div>
        <div class="stat">
          <div class="stat-number">${totalImages}</div>
          <div class="stat-label">Total Images</div>
        </div>
      </div>
    </header>
    
    <section class="categories-section">
      <h2>Browse Categories</h2>
      <div class="categories-grid">
        ${categoryCardsHtml}
      </div>
    </section>
    
    ${gallerySectionsHtml}
    
    <footer>
      <p>© 2024 Free Wallpapers. All images are displayed for browsing purposes. Please respect individual image copyrights.</p>
    </footer>
  </div>
  
  <div id="lightbox" class="lightbox">
    <div class="lightbox-content">
      <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
      <img id="lightbox-img" class="lightbox-img" src="" alt="">
    </div>
  </div>
  
  <script>
    function openLightbox(imageSrc) {
      const lightbox = document.getElementById('lightbox');
      const img = document.getElementById('lightbox-img');
      img.src = imageSrc;
      lightbox.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
      const lightbox = document.getElementById('lightbox');
      lightbox.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
    
    document.getElementById('lightbox').addEventListener('click', function(e) {
      if (e.target === this) closeLightbox();
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  </script>
</body>
</html>`;
  
  return html;
}

/**
 * Main execution
 */
try {
  const categories = getCategoriesData();
  
  if (categories.length === 0) {
    console.error(`No image categories found in ${OUTPUT_DIR}`);
    console.error('Run "npm run fetch-images" first to download images.');
    process.exit(1);
  }
  
  console.log(`Found ${categories.length} categories:`);
  categories.forEach(cat => {
    console.log(`  • ${cat.displayName}: ${cat.count} images`);
  });
  
  const html = generateHtmlIndex(categories);
  const indexPath = path.join(OUTPUT_DIR, 'index.html');
  
  fs.writeFileSync(indexPath, html, 'utf8');
  
  console.log(`\n✨ Gallery index created: ${path.resolve(indexPath)}`);
  console.log(`\n📌 Open in browser: file://${path.resolve(indexPath)}`);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
