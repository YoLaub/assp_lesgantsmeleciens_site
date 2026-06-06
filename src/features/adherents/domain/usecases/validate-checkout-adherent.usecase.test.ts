import { describe, it, expect } from 'vitest';
import { ValidateCheckoutAdherentUseCase } from './validate-checkout-adherent.usecase';
import { createMockAdherentRepository } from '../../__tests__/mock-repository';
import { makeAdherentWithDetails } from '../../__tests__/fixtures';

describe('ValidateCheckoutAdherentUseCase', () => {
    const adherentPret = makeAdherentWithDetails({
        typePaiement: 'en_ligne',
        inscriptionValide: false,
        montantSnapshot: 140,
        reglementSigne: 'valide',
        certificatMedicalReq: false,
        dateDeNaissance: new Date('1990-01-01'),
    });

    it('valide le checkout si toutes les conditions sont remplies', async () => {
        const repo = createMockAdherentRepository();
        const useCase = new ValidateCheckoutAdherentUseCase(repo);

        const result = await useCase.execute(adherentPret);

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().montantSnapshot).toBe(140);
    });

    it("rejette si typePaiement n'est pas en_ligne", async () => {
        const repo = createMockAdherentRepository();
        const useCase = new ValidateCheckoutAdherentUseCase(repo);

        const result = await useCase.execute({ ...adherentPret, typePaiement: 'sur_place' });

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Mode de paiement non applicable');
    });

    it('rejette si inscription déjà validée', async () => {
        const repo = createMockAdherentRepository();
        const useCase = new ValidateCheckoutAdherentUseCase(repo);

        const result = await useCase.execute({ ...adherentPret, inscriptionValide: true });

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Inscription déjà validée');
    });

    it('rejette si montant manquant', async () => {
        const repo = createMockAdherentRepository();
        const useCase = new ValidateCheckoutAdherentUseCase(repo);

        const result = await useCase.execute({ ...adherentPret, montantSnapshot: null });

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Montant introuvable');
    });

    it("rejette si le règlement n'est pas validé", async () => {
        const repo = createMockAdherentRepository();
        const useCase = new ValidateCheckoutAdherentUseCase(repo);

        const result = await useCase.execute({ ...adherentPret, reglementSigne: 'declare' });

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Documents en attente de validation');
    });

    it('rejette si certificat requis mais non validé', async () => {
        const repo = createMockAdherentRepository();
        const useCase = new ValidateCheckoutAdherentUseCase(repo);

        const result = await useCase.execute({
            ...adherentPret,
            certificatMedicalReq: true,
            certificatMedical: 'declare',
        });

        expect(result.isErr()).toBe(true);
    });
});
