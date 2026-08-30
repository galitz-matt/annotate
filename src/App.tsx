import { useState } from "react";
import { PdfPicker } from "./components/PdfPicker";
import { PdfViewer } from "./components/PdfViewer";

function App() {
    const [path, setPath] = useState<string | null>(null);

    return (
        <div>
            <PdfPicker 
                value={path}
                onChange={setPath}
            />

            {path && (
                <PdfViewer path={path} />
            )}
        </div>
    );
}

export default App;