import { getAllActualitesAction } from "@/app/admin/content/actions/actions";
import { ActualiteTable } from "./ActualiteTable";

export const ActualiteManager = async () => {
    const result = await getAllActualitesAction();

    if (!result.success || !result.actualites) {
        return <div>Erreur lors du chargement des actualités</div>;
    }

    return <ActualiteTable initialActualites={result.actualites} />;
};
