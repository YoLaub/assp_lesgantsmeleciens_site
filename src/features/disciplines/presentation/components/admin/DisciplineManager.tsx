import { getAllDisciplinesAction } from "@/app/admin/content/actions/actions";
import { DisciplineTable } from "./DisciplineTable";

export const DisciplineManager = async () => {
    const result = await getAllDisciplinesAction();

    if (!result.success || !result.disciplines) {
        return <div>Erreur lors du chargement des disciplines</div>;
    }

    return <DisciplineTable initialDisciplines={result.disciplines} />;
};
