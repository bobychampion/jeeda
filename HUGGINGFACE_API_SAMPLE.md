# Hugging Face API Call Samples

This document shows examples of the actual API calls being made to Hugging Face.

## Image-to-Image Generation (Preferred Method)

When modifying a template, we first try image-to-image generation:

### Example: Modifying "Modern Minimalist Media Console" with Red color and Gold legs

**Step 1: Download Template Image**
```javascript
// Template image URL from Cloudinary/Firestore
const templateImageUrl = "https://res.cloudinary.com/dqyhhzkyb/image/upload/v1234567890/templates/tv-console.jpg";

// Download and convert to Blob
const response = await fetch(templateImageUrl);
const templateImageBlob = await response.blob();
// Blob type: "image/jpeg" or "image/png"
```

**Step 2: Build Modification Prompt**
```javascript
// User modifications:
const modifications = {
    color: "Red",
    description: "With gold legs"
};

// Converted to modification text:
const modificationText = "change color to Red, With gold legs";

// Full prompt sent to API:
const fullPrompt = "change color to Red, With gold legs, maintain exact same structure and design, product photography, white background, isolated object";

// Negative prompt (what to avoid):
const negativePrompt = "room, interior, living room, bedroom, scene, environment, background, wall, walls, window, windows, curtain, curtains, rug, rugs, multiple furniture, other furniture, people, person, human, decorative, decoration, lifestyle, interior design, home decor, room setting, full scene";
```

**Step 3: API Call to Hugging Face**
```javascript
const response = await hf.imageToImage({
    model: 'timbrooks/instruct-pix2pix',  // or fallback models
    inputs: templateImageBlob,  // The actual image blob from template
    parameters: {
        prompt: "change color to Red, With gold legs, maintain exact same structure and design, product photography, white background, isolated object",
        negative_prompt: "room, interior, living room, bedroom, scene, environment, background, wall, walls, window, windows, curtain, curtains, rug, rugs, multiple furniture, other furniture, people, person, human, decorative, decoration, lifestyle, interior design, home decor, room setting, full scene",
        strength: 0.6  // 0-1, how much to modify (0.6 = moderate modification)
    },
});
```

**Actual HTTP Request (simplified):**
```
POST https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix
Headers:
  Authorization: Bearer YOUR_HUGGINGFACE_API_TOKEN
  Content-Type: multipart/form-data

Body:
  inputs: [Binary image data from template]
  parameters: {
    "prompt": "change color to Red, With gold legs, maintain exact same structure and design, product photography, white background, isolated object",
    "negative_prompt": "room, interior, living room, bedroom, scene, environment, background, wall, walls, window, windows, curtain, curtains, rug, rugs, multiple furniture, other furniture, people, person, human, decorative, decoration, lifestyle, interior design, home decor, room setting, full scene",
    "strength": 0.6
  }
```

**Response:**
```javascript
// Returns a Blob containing the generated image
const imageBlob = await response;  // Blob type: "image/png"
```

---

## Text-to-Image Generation (Fallback Method)

If image-to-image fails, we fall back to text-to-image:

### Example: Same TV Console Modification

**Prompt Construction:**
```javascript
// Template details:
const templateName = "Modern Minimalist Media Console";
const templateCategory = "TV Consoles";
const templateDescription = "Sleek and modern media console...";

// Build prompt:
const furnitureKeyword = "TV console media console entertainment center";
const basePrompt = "TV console media console entertainment center, TV console media console entertainment center, TV console media console entertainment center, product photography";
const modsText = ", change color to Red, With gold legs";
const restrictions = ", white background, isolated object, single item, no room, no scene, no environment, no other furniture, no people, no plants, no decorative items, professional studio lighting, e-commerce catalog style";

const prompt = "TV console media console entertainment center, TV console media console entertainment center, TV console media console entertainment center, product photography, change color to Red, With gold legs, white background, isolated object, single item, no room, no scene, no environment, no other furniture, no people, no plants, no decorative items, professional studio lighting, e-commerce catalog style";
```

**API Call:**
```javascript
const response = await hf.textToImage({
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    inputs: prompt,  // Just the text prompt, no image
    parameters: {
        negative_prompt: "room, interior, living room, bedroom, kitchen, dining room, scene, environment, background, wall, walls, window, windows, curtain, curtains, rug, rugs, carpet, floor, ceiling, multiple furniture, other furniture, sofa, chair, table, lamp, plant, plants, people, person, human, decorative, decoration, lifestyle, interior design, home decor, room setting, full scene, environment, background objects, other items, additional furniture, room scene, interior scene, home interior, room interior, lifestyle photography, home photography, interior photography, ..."
    },
});
```

**Actual HTTP Request (simplified):**
```
POST https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0
Headers:
  Authorization: Bearer YOUR_HUGGINGFACE_API_TOKEN
  Content-Type: application/json

Body:
{
  "inputs": "TV console media console entertainment center, TV console media console entertainment center, TV console media console entertainment center, product photography, change color to Red, With gold legs, white background, isolated object, single item, no room, no scene, no environment, no other furniture, no people, no plants, no decorative items, professional studio lighting, e-commerce catalog style",
  "parameters": {
    "negative_prompt": "room, interior, living room, bedroom, kitchen, dining room, scene, environment, background, wall, walls, window, windows, curtain, curtains, rug, rugs, carpet, floor, ceiling, multiple furniture, other furniture, sofa, chair, table, lamp, plant, plants, people, person, human, decorative, decoration, lifestyle, interior design, home decor, room setting, full scene, environment, background objects, other items, additional furniture, room scene, interior scene, home interior, room interior, lifestyle photography, home photography, interior photography, ..."
  }
}
```

**Response:**
```javascript
// Returns a Blob containing the generated image
const imageBlob = await response;  // Blob type: "image/png"
```

---

## Models Tried (in order)

### Image-to-Image Models:
1. `timbrooks/instruct-pix2pix` - Instruction-based image editing
2. `lllyasviel/sd-controlnet-depth` - ControlNet for structure preservation
3. `runwayml/stable-diffusion-v1-5` - Base SD model

### Text-to-Image Models:
1. `stabilityai/stable-diffusion-xl-base-1.0` - High quality generation

---

## Complete Flow Example

```javascript
// 1. User submits modifications
const userModifications = {
    color: "Red",
    description: "With gold legs"
};

// 2. Backend processes
const modificationText = "change color to Red, With gold legs";
const templateImageUrl = "https://res.cloudinary.com/.../tv-console.jpg";

// 3. Try image-to-image first
try {
    const imageBlob = await hf.imageToImage({
        model: 'timbrooks/instruct-pix2pix',
        inputs: await downloadImage(templateImageUrl),
        parameters: {
            prompt: `${modificationText}, maintain exact same structure and design, product photography, white background, isolated object`,
            negative_prompt: "room, interior, living room, bedroom, scene, environment, background, wall, walls, window, windows, curtain, curtains, rug, rugs, multiple furniture, other furniture, people, person, human, decorative, decoration, lifestyle, interior design, home decor, room setting, full scene",
            strength: 0.6
        },
    });
} catch (error) {
    // 4. Fallback to text-to-image
    const imageBlob = await hf.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: "TV console media console entertainment center, TV console media console entertainment center, TV console media console entertainment center, product photography, change color to Red, With gold legs, white background, isolated object, single item, no room, no scene, no environment, no other furniture, no people, no plants, no decorative items, professional studio lighting, e-commerce catalog style",
        parameters: {
            negative_prompt: "room, interior, living room, bedroom, kitchen, dining room, scene, environment, background, wall, walls, window, windows, curtain, curtains, rug, rugs, carpet, floor, ceiling, multiple furniture, other furniture, sofa, chair, table, lamp, plant, plants, people, person, human, decorative, decoration, lifestyle, interior design, home decor, room setting, full scene, environment, background objects, other items, additional furniture, room scene, interior scene, home interior, room interior, lifestyle photography, home photography, interior photography, ..."
        },
    });
}

// 5. Convert blob to base64 for Cloudinary
const base64Image = await blobToBase64(imageBlob);
// Result: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."

// 6. Upload to Cloudinary
const uploadResult = await uploadImage(base64Image, 'ai-modified-furniture');
// Returns: { url: "https://res.cloudinary.com/.../ai-modified-furniture/...", public_id: "..." }
```

---

## Key Parameters Explained

- **strength** (0-1): How much to modify the image
  - 0.0 = Keep original (no changes)
  - 0.6 = Moderate modification (recommended)
  - 1.0 = Full modification (may lose structure)

- **prompt**: What to change/add
  - Should be specific: "change color to Red"
  - Include structure preservation: "maintain exact same structure"

- **negative_prompt**: What to avoid
  - Prevents unwanted elements: "no room, no scene, no other furniture"

