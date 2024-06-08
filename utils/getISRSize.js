import fs from "fs";
import path from "path";

export const withISRtoSSRWrapper =
  ({
    getProps,
    isStatic = true,
    handleLimit = () => {},
    handleNotLimit = () => {},
    thresholdKB = 400,
    timeoutMS = 10000,
    destination = () => {},
  }) =>
  async (context) => {
    const { slug = "" } = context.params; // Assuming 'slug' is available in context.params
    const destinationCb = destination(slug);
    const currentFilePath = __filename;
    const currentFile = currentFilePath.split("/").pop();
    const currentFolder = currentFilePath
      .replace(currentFile, "")
      .replace("ssr", "isr");
    let filenames = false;
    try {
      filenames = fs.readdirSync(currentFolder);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.error(`Directory not found: ${currentFolder}`);
      } else {
        throw err; // Rethrow if it's not an ENOENT error
      }
    }
    let returnHandleLimit = {};
    let returnHandleNotLimit = {};
    let isServerTimeout = false;

    // Object to store file sizes in KB
    const fileSizes = {};
    let totalSizeKB = 0;
    let isLimitReached = false;

    const redirect = {
      redirect: {
        destination: destinationCb,
        permanent: false,
      },
    };

    // Function to check file size in KB
    const checkFileSize = (filePath) => {
      const stats = fs.statSync(filePath);
      const fileSizeKB = (stats.size / 1024).toFixed(2); // Convert bytes to KB and round to 2 decimal places
      return { fileSizeKB };
    };

    if (filenames) {
      filenames.forEach((filename) => {
        const filePath = path.join(currentFolder, filename);
        // Check if the file is .html or .json and not the current file
        if (
          !filename.includes(currentFile) &&
          (filename.endsWith(".html") || filename.endsWith(".json"))
        ) {
          const { fileSizeKB } = checkFileSize(filePath);
          fileSizes[filename] = { fileSizeKB };
          totalSizeKB += parseFloat(fileSizeKB);
        }
      });

      console.log(`Log -> File sizes (KB) on ${currentFolder}:`, fileSizes);
      console.log(`Log -> Total file sizes (KB):`, totalSizeKB.toFixed(2)); // Rounding to 2 decimal places

      isLimitReached = totalSizeKB >= thresholdKB;
    }
    // Execute handleLimit callback and return the rewrite response
    else if (isLimitReached && typeof handleLimit === "function") {
      returnHandleLimit = await handleLimit();
    }

    if (isLimitReached && isStatic) {
      return redirect;
    }

    // Execute handleNotLimit callback and return the rewrite response
    if (!isLimitReached && typeof handleNotLimit === "function") {
      returnHandleNotLimit = await handleNotLimit();
    }

    if (!isLimitReached && !isStatic) {
      return redirect;
    }
    // Timeout handler for getProps
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        isServerTimeout = true;
        resolve({ props: { isServerTimeout } });
      }, timeoutMS); // 10 seconds timeout
    });
    const getPropsPromise = getProps(context);
    const returnProps = await Promise.race([getPropsPromise, timeoutPromise]);
    return {
      props: {
        isServerTimeout,
        isStatic,
        ...returnProps.props,
        isLimitReached,
        ...returnHandleLimit,
        ...returnHandleNotLimit,
      },
      ...(returnProps?.revalidate
        ? { revalidate: returnProps?.revalidate }
        : {}),
    };
  };
