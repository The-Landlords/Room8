describe('Room8 app', () => {
    it('loads the sign in page', () => {
        cy.visit('/');
        cy.contains(/sign|login/i);
    });
});
