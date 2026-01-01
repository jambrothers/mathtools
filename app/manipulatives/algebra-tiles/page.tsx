import AlgebraTiles from "../components/AlgebraTiles";

export default function AlgebraTilesPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-2xl text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
                    Algebra Tiles
                </h1>
                <AlgebraTiles />
            </div>
        </div>
    )
}
