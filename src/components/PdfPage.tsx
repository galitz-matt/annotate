import { PDFJS } from "../pdfjs";
import { useRef, useEffect } from "react";

export type PdfPageProps = {
    pdf: PDFJS.PDFDocumentProxy;
    pageNumber: number;
}

export function PdfPage({ pdf, pageNumber }: PdfPageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let renderTask: PDFJS.RenderTask | null = null;
        let isCancelled = false;

        async function renderPage() {
            const page = await pdf.getPage(pageNumber);

            if (isCancelled) return;

            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = canvasRef.current;
            if (!canvas) return;

            const context = canvas.getContext("2d");
            if (!context) return;

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            renderTask = page.render({
                canvasContext: context,
                viewport,
                canvas,
            });

            try {
                await renderTask.promise;
            } catch (error) {
                if (error instanceof Error && error.name === "RenderingCancelledException") {
                    return;
                }

                throw error;
            }
        }

        renderPage();
        
        return () => {
            isCancelled = true;
            renderTask?.cancel();
        };
    }, [pdf, pageNumber]);

    return <canvas ref={canvasRef} />;
}