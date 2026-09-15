import { PDFJS } from "../pdfjs";
import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { TextItem, TextMarkedContent, TextStyle } from "pdfjs-dist/types/src/display/api";
import { Vector2D } from "../types/vector";
import { TextLayerData } from "../types/text-layer/text-layer-data";

export type PdfPageProps = {
    pdf: PDFJS.PDFDocumentProxy;
    pageNumber: number;
}

export function PdfPage({ pdf, pageNumber }: PdfPageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [textLayerData, setTextLayerData] = useState<TextLayerData | null>(null);

    useEffect(() => {
        let renderTask: PDFJS.RenderTask | null = null;
        let isCancelled = false;

        async function renderPage() {
            const page = await pdf.getPage(pageNumber);

            if (isCancelled) return;

            const textContent = await page.getTextContent();

            if (isCancelled) return;

            const viewport = page.getViewport({ scale: 1 });

            setTextLayerData({
                items: textContent.items.filter(isTextItem),
                styles: textContent.styles,
                viewport
            })

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

    useLayoutEffect(() => {
        if (!textLayerData) return;

        textLayerData.items.forEach((item, index) => {
            const element = textRefs.current[index];
            if (!element) return;

            element.style.transform = "";
            // Measure the width produced by the browser's font/layout engine.
            const actualWidth = element.getBoundingClientRect().width;
            if (actualWidth === 0) return;

            // Compute the width that this text item should occupy in
            // PDF.js viewport coordinates.
            const desiredWidth = computeViewportTextWidth(
                item,
                textLayerData.viewport
            );

            const scaleX = desiredWidth / actualWidth;

            // Preserve the left edge that we already positioned correctly.
            element.style.transformOrigin = "0 0";
            element.style.transform = `scaleX(${scaleX})`;
        });
    }, [textLayerData]);

    return ( 
        <div className="pdf-page" style={{ 
            position: "relative", 
            width: "fit-content",
            WebkitUserSelect: "none"
        }}>
            <canvas ref={canvasRef} />
            <div className="text-layer" style={{ position: "absolute", inset: 0 }}>
                {textLayerData && textLayerData.items.map((item, index) => (
                    mapTextItemToDiv(
                        index, 
                        item, 
                        textLayerData.viewport, 
                        textLayerData.styles,
                        (element) => { textRefs.current[index] = element }
                    )
                ))}
            </div>
        </div>
    );
}

function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
    return (item as TextItem).transform !== undefined;
}

function mapTextItemToDiv(
    index: number,
    item: TextItem,
    viewport: PDFJS.PageViewport,
    styles: { [x: string] : TextStyle },
    ref: (element: HTMLDivElement | null) => void
) {
    const baselineCoordinates = mapTextToViewport({ x: 0, y: 0 }, item, viewport);
    const effectiveHeight = computeViewportTextHeight(item, viewport);
    const ascent = styles[item.fontName].ascent;
    const top = baselineCoordinates.y - (effectiveHeight * ascent);
    const left = baselineCoordinates.x;

    const div =  (
        <div
            key={index}
            ref={ref}
            style={{
                position: "absolute",
                top: `${top}px`,
                left: `${left}px`,
                fontSize: `${effectiveHeight}px`,
                fontFamily: styles[item.fontName].fontFamily,
                color: "transparent",
                WebkitUserSelect: "text"
            }}
        >
            {item.str}
        </div>
    );

    return div;
}

function transform(vector: Vector2D, transform: number[]): Vector2D {
    if (transform.length !== 6) {
        throw new Error("Transform array must have 6 elements");
    }
    const [a, b, c, d, e, f] = transform;
    const x = a * vector.x + c * vector.y + e;
    const y = b * vector.x + d * vector.y + f;
    return { x, y };
}

function mapTextToViewport(vector: Vector2D, item: TextItem, viewport: PDFJS.PageViewport): Vector2D {
    return transform(transform(vector, item.transform), viewport.transform);
}

function computeViewportTextHeight(item: TextItem, viewport: PDFJS.PageViewport): number {
    const origin = mapTextToViewport({x: 0, y: 0}, item, viewport);
    const oneUnitUp = mapTextToViewport({ x: 0, y: 1 }, item, viewport);

    const dx = oneUnitUp.x - origin.x;
    const dy = oneUnitUp.y - origin.y;

    return Math.hypot(dx, dy);
}

function computeViewportTextWidth(item: TextItem, viewport: PDFJS.PageViewport): number {
    const [a, b] = viewport.transform;
    return Math.abs(item.width) * Math.hypot(a, b);
}