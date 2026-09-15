import { readFile } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";
import { PDFJS } from "../pdfjs";
import { PdfPage } from "./PdfPage";

export type PdfViewerProps = {
    path: string;
}

export function PdfViewer({ path }: PdfViewerProps) {
    const [pdf, setPdf] = useState<PDFJS.PDFDocumentProxy | null>(null);

    useEffect(() => {
        loadPdf(path)
            .then(setPdf)
            .catch((error) => {
                console.error("Error loading PDF:", error);
            });
    }, [path]);

    if (!path) {
        return <div>Please select a PDF file to view.</div>;
    }
    if (!pdf) {
        return <div>Loading PDF...</div>;
    }

    return (
        <div className="pdf-scroll-container">
            {Array.from({ length: pdf.numPages }, (_, i) => (
                <PdfPage
                    key={i + 1}
                    pdf={pdf}
                    pageNumber={i + 1}
                />
            ))}
        </div> 
    )
}

async function loadPdf(path: string): Promise<PDFJS.PDFDocumentProxy> {
    const pdfBytes = await readFile(path);
    const loadingTask = PDFJS.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    return pdf;
}