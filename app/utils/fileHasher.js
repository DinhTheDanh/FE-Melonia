import SparkMD5 from "spark-md5";

export const calculateMD5 = (file) => {
  return new Promise((resolve, reject) => {
    // Đọc file theo từng chunk (2MB/chunk) để tiết kiệm RAM
    const blobSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice;
    const chunkSize = 2097152; // 2MB
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    fileReader.onload = function (e) {
      spark.append(e.target.result); // Thêm dữ liệu vào bộ tính toán
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        const hash = spark.end(); // Ra chuỗi MD5: vd "e10adc3949ba59abbe56e057f20f883e"
        resolve(hash);
      }
    };

    fileReader.onerror = function () {
      reject("Lỗi đọc file");
    };

    function loadNext() {
      var start = currentChunk * chunkSize;
      var end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();
  });
};
