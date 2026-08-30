import { PDFJS } from "../pdfjs";
import { useRef, useEffect } from "react";

export type PdfPageProps = {
    pdf: PDFJS.PDFDocumentProxy;
    pageNumber: number;
}

export function PdfPage({ pdf, pageNumber }: PdfPageProps) {
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        renderPage(pdf, pageNumber, canvas);
    }, [pdf, pageNumber]);

    return <canvas ref={canvas} />;
}

async function renderPage(
    pdf: PDFJS.PDFDocumentProxy, 
    pageNumber: number,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport, canvas }).promise;
}