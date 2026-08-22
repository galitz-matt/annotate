import { useState } from "react";
import { FilePicker } from "./components/FilePicker";

function App() {
    const [file, setFile] = useState<string | null>(null);

    return (
        <div>
            <FilePicker 
                value={file}
                onChange={setFile}
            />
        </div>
    );
}

export default App;