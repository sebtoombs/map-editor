export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener(
      "load",
      () => {
        if (!fileReader.result) {
          reject("FileReader result is null");
          return;
        }

        // @ts-ignore - FileReader.result is a string if we call readAsDataURL
        resolve(fileReader.result);
      },
      false
    );
    fileReader.addEventListener("error", reject, false);

    fileReader.readAsDataURL(file);
  });
}

export async function getImageDimensions(
  fileData: string
): Promise<{ width: number; height: number }> {
  const img = document.createElement("img");
  const imageDimensions: { width: number; height: number } = await new Promise(
    (resolve, reject) => {
      img.style.opacity = "0";
      img.style.visibility = "hidden";
      img.onload = () => {
        resolve({ width: img.clientWidth, height: img.clientHeight });
      };
      document.body.append(img);
      img.src = fileData as string;
    }
  );
  img.remove();
  return imageDimensions;
}
