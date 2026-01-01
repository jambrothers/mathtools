import AlgebraTiles from "../components/AlgebraTiles";
import { SetPageTitle } from "@/components/set-page-title";

export default function AlgebraTilesPage() {
    return (
        <div className="flex flex-col h-full w-full">
            <SetPageTitle title="Algebra Tiles" />
            <div className="flex-1 w-full overflow-hidden">
                <AlgebraTiles />
            </div>
        </div>
    )
}
