import * as PDFJS from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

PDFJS.GlobalWorkerOptions.workerSrc = pdfWorker;

export { PDFJS };