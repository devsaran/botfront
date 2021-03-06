/* global cy:true */

describe('NLU canonical examples', function () {
    beforeEach(function () {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'fr');
        cy.visit('/login');
        cy.login();
    });

    after(function () {
        cy.deleteProject('bf');
    });
    
    it('should be possible to mark an example as canonical', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello{enter}hi');
        cy.dataCy('intent-label')
            .first()
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .last()
            .should('have.class', 'grey');
        cy.dataCy('icon-gem')
            .first()
            .should('have.class', 'black');
        cy.dataCy('icon-gem')
            .last()
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('icon-gem')
            .should('have.class', 'black');
        cy.dataCy('icon-gem')
            .first()
            .should('have.class', 'grey');
    });

    it('should display a popup for canonical example', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .should('have.class', 'black');
        cy.dataCy('icon-gem')
            .trigger('mouseover');
        cy.get('.popup').should('exist');
        cy.get('.popup .content').should('have.text', 'This example is canonical for the intent intenttest');
    });

    it('should not be possible to delete or edit a canonical example', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-trash')
            .should('have.class', 'disabled-delete');
        cy.dataCy('intent-label').trigger('mouseover');
        cy.get('.popup').should('contain', 'Cannot edit');
        cy.dataCy('utterance-text').trigger('mouseover');
        cy.get('.popup').should('contain', 'Cannot edit');
    });

    it('should be possible switch canonical examples ', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\nwelcome');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .last()
            .click({ force: true });
        cy.get('.s-alert-box-inner').should('exist');
        cy.dataCy('gem')
            .children()
            .should('have.class', 'black');
        // just match the first part of the message as linebreaks may happen and are difficult to match
        cy.get('.s-alert-box-inner').should('contain.text',
            'The previous canonical example with');
        cy.dataCy('icon-gem')
            .first()
            .should('have.class', 'grey');
        cy.dataCy('icon-gem')
            .last()
            .should('have.class', 'black');
    });


    it('should be possible display only canonical examples ', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\nwelcome');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.contains('welcome').should('exist');
        cy.dataCy('only-canonical').find('input').click({ force: true });
        cy.dataCy('only-canonical').should('have.class', 'checked');
        cy.contains('hello').should('exist');
        cy.contains('welcome').should('not.exist');
    });
    
    it('canonical should be unique per intent, entity and entity value', function () {
        // firstly import all the testing data
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-settings').click();
        cy.contains('Import').click();
        cy.fixture('nlu_import_canonical.json', 'utf8').then((content) => {
            cy.get('.file-dropzone').upload(content, 'data.json');
        });
        cy.contains('Import Training Data').click();
        cy.get('.s-alert-success').should('be.visible');
        cy.visit('/project/bf/nlu/models');
        cy.contains('Training Data').click();
        // we should be able to mark all those as canonical
        /* .each may cause the test to not pass as its detach the
        element from the DOM */
        cy.dataCy('icon-gem').eq(0).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(1).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(2).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(3).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(4).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(5).click({ force: true });
        cy.wait(200);
        cy.get('.black[data-cy=icon-gem]').should('have.length', 6);
    });
    
    it('should tag the first example for an intent created in the visual editor as canonical', function () {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-user-line').click({ force: true });
        cy.dataCy('user-line-from-input').click({ force: true });
        cy.dataCy('utterance-input')
            .find('input')
            .type('this example should be canonical{enter}');
        cy.dataCy('intent-label').last().click();
        cy.dataCy('intent-dropdown').find('input')
            .type('intenttest{enter}');
        cy.dataCy('intent-label').contains('intenttest').should('exist');
        cy.dataCy('save-new-user-input').click();
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('icon-gem').should('have.class', 'black');
    });
});
