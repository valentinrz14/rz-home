// ─── Imágenes del producto rz room — Estructura Doble Motor ───────────────
//
// ⚠️  CÓMO AGREGAR LAS FOTOS REALES DEL PRODUCTO:
//
// 1. Abrí la publicación de Amazon: https://www.amazon.com/dp/B0DL58KZWN
// 2. Hacé clic derecho en cada foto del producto → "Guardar imagen como"
// 3. Guardalas en /public/images/products/ con estos nombres exactos:
//
//    estructura-principal.jpg   → foto frontal de la estructura
//    estructura-angulo.jpg      → foto en ángulo / perspectiva
//    estructura-panel.jpg       → foto del panel de control / display
//    estructura-base.jpg        → foto de la base / patas
//    escritorio-completo.jpg    → foto con tapa puesta
//    escritorio-angulo.jpg      → vista lateral escritorio completo
//    tapa-madera.jpg            → foto de la tapa sola
//    tapa-textura.jpg           → primer plano de la textura
//    hero-escritorio.jpg        → foto grande para el hero
//
// 4. Una vez guardadas, reemplazá las rutas de este archivo:
//    de: "https://images.unsplash.com/..."
//    a:  "/images/products/estructura-principal.jpg"

export const PRODUCT_IMAGES = {
  // Imagen del hero (1920x1080 ideal)
  hero: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1920&q=90",

  // Galería estructura rz room
  // Reemplazar con: /images/products/estructura-xxx.jpg
  structure: {
    main: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=85",
    panel: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=85",
    base: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=85",
    lifestyle: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=85",
  },

  // Galería escritorio completo (estructura + tapa)
  // Reemplazar con: /images/products/escritorio-xxx.jpg
  complete: {
    main: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=85",
    angle: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=85",
    workspace: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=85",
    closeup: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=85",
  },

  // Galería tapa sola
  // Reemplazar con: /images/products/tapa-xxx.jpg
  tabletop: {
    main: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85",
    texture: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=85",
  },
} as const;
