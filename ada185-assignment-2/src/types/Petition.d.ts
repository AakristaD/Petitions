type Petition = {
    petitionId: number;
    title: string;
    categoryId: number;
    creationDate: number;
    ownerId: number;
    ownerFirstName: string;
    ownerLastName: string;
    numberOfSupporters: number;
    moneyRaised: number;
    supportTiers: Array<SupportTier>;
    description:string;
    supportingCost: number;
};