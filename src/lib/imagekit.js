export const uploadToImageKit = async (file, fileName) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const response = await fetch("/api/imageKit/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const result = await response.json();

    return {
      success: true,
      data: {
        fileId: result.fileId,
        name: result.name,
        url: result.url,
        width: result.width,
        height: result.height,
        size: result.size,
      },
    };
  } catch (error) {
    console.error("ImageKit upload error : ", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const buildTransformationUrl = (src, transformations = []) => {
  if (!transformations.length) return src;

  const transformationString = transformations
    .map((transform) => {
      const params = [];

      // Resize
      if (transform.width) params.push(`w-${transform.width}`);
      if (transform.height) params.push(`h-${transform.height}`);
      if (transform.focus) params.push(`fo-${transform.focus}`);
      if (transform.cropMode) params.push(`cm-${transform.cropMode}`);

      // AI effects
      if (transform.effect) params.push(`e-${transform.effect}`);

      // Text overlay
      if (transform.overlayText) {
        const layer = [];

        layer.push("l-text");

        // Encode text
        layer.push(`i-${encodeURIComponent(transform.overlayText)}`);

        if (transform.overlayTextFontSize) {
          layer.push(`fs-${transform.overlayTextFontSize}`);
        }

        if (transform.overlayTextColor) {
          layer.push(`co-${transform.overlayTextColor}`);
        }

        if (transform.overlayBackground) {
          layer.push(`bg-${transform.overlayBackground}`);
        }

        if (transform.overlayTextPadding) {
          layer.push(`pa-${transform.overlayTextPadding}`);
        }

        const gravityMap = {
          center: "center",
          north: "top",
          south: "bottom",
          east: "right",
          west: "left",
          north_west: "top_left",
          north_east: "top_right",
          south_west: "bottom_left",
          south_east: "bottom_right",
        };

        if (transform.gravity) {
          layer.push(`lfo-${gravityMap[transform.gravity] || "center"}`);
        }

        layer.push("l-end");

        params.push(layer.join(","));
      }

      return params.join(",");
    })
    .filter(Boolean)
    .join(":");

  if (src.includes("/tr:")) {
    return src.replace("/tr:", `/tr:${transformationString}:`);
  }

  const urlParts = src.split("/");
  urlParts.splice(urlParts.length - 1, 0, `tr:${transformationString}`);
  return urlParts.join("/");
};