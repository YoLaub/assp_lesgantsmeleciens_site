import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateNaissanceSelect } from "./DateNaissanceSelect";

/**
 * Harness contrôlé : reproduit l'usage réel (la valeur émise revient en `value`),
 * indispensable pour tester l'accumulation des trois menus.
 */
function Harness({ initial = "" }: { initial?: string }) {
    const [v, setV] = useState(initial);
    return (
        <>
            <DateNaissanceSelect value={v} onChange={setV} minYear={1990} />
            <output data-testid="iso">{v}</output>
        </>
    );
}

const iso = () => (screen.getByTestId("iso") as HTMLOutputElement).textContent;
const jour = () => screen.getByLabelText("Jour") as HTMLSelectElement;
const mois = () => screen.getByLabelText("Mois") as HTMLSelectElement;
const annee = () => screen.getByLabelText("Année") as HTMLSelectElement;

describe("DateNaissanceSelect", () => {
    it("rend les trois menus avec leurs placeholders", () => {
        render(<Harness />);
        expect(jour().value).toBe("");
        expect(mois().value).toBe("");
        expect(annee().value).toBe("");
        expect(iso()).toBe("");
    });

    it("n'émet pas de date tant que la sélection est incomplète", () => {
        render(<Harness />);
        fireEvent.change(jour(), { target: { value: "24" } });
        expect(iso()).toBe("");
        fireEvent.change(mois(), { target: { value: "06" } });
        expect(iso()).toBe("");
    });

    it("conserve une sélection partielle (jour choisi avant l'année)", () => {
        render(<Harness />);
        // Le bug initial : sans état interne, le jour se réinitialisait ici.
        fireEvent.change(jour(), { target: { value: "24" } });
        expect(jour().value).toBe("24");
        fireEvent.change(mois(), { target: { value: "06" } });
        expect(jour().value).toBe("24");
        expect(mois().value).toBe("06");
    });

    it("émet l'ISO AAAA-MM-JJ une fois les trois menus renseignés", () => {
        render(<Harness />);
        fireEvent.change(jour(), { target: { value: "24" } });
        fireEvent.change(mois(), { target: { value: "06" } });
        fireEvent.change(annee(), { target: { value: "1990" } });
        expect(iso()).toBe("1990-06-24");
    });

    it("borne le jour quand le mois choisi a moins de jours (31 → 28 en février)", () => {
        render(<Harness />);
        fireEvent.change(jour(), { target: { value: "31" } });
        fireEvent.change(annee(), { target: { value: "1995" } });
        fireEvent.change(mois(), { target: { value: "02" } });
        expect(iso()).toBe("1995-02-28");
        expect(jour().value).toBe("28");
    });

    it("gère le 29 février sur une année bissextile", () => {
        render(<Harness />);
        fireEvent.change(jour(), { target: { value: "31" } });
        fireEvent.change(annee(), { target: { value: "2000" } });
        fireEvent.change(mois(), { target: { value: "02" } });
        expect(iso()).toBe("2000-02-29");
    });

    it("pré-remplit les menus depuis une valeur ISO existante", () => {
        render(<DateNaissanceSelect value="1985-12-05" onChange={() => {}} minYear={1980} />);
        expect((screen.getByLabelText("Jour") as HTMLSelectElement).value).toBe("05");
        expect((screen.getByLabelText("Mois") as HTMLSelectElement).value).toBe("12");
        expect((screen.getByLabelText("Année") as HTMLSelectElement).value).toBe("1985");
    });

    it("désactive les menus quand disabled", () => {
        render(<DateNaissanceSelect value="" onChange={() => {}} disabled />);
        expect((screen.getByLabelText("Jour") as HTMLSelectElement).disabled).toBe(true);
        expect((screen.getByLabelText("Mois") as HTMLSelectElement).disabled).toBe(true);
        expect((screen.getByLabelText("Année") as HTMLSelectElement).disabled).toBe(true);
    });
});
