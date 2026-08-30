import * as PDFJS from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

PDFJS.GlobalWorkerOptions.workerSrc = pdfWorker;

export { PDFJS };