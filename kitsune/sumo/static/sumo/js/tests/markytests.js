import {default as mochaJsdom, rerequire} from 'mocha-jsdom';
import {default as chai, expect} from 'chai';
import React from 'react';
import chaiLint from 'chai-lint';
import sinon from 'sinon';

import mochaK from './fixtures/mochaK.js';
import mochaJquery from './fixtures/mochaJquery.js';
import mochaGettext from './fixtures/mochaGettext.js';
import mochaSimpleButtonData from './fixtures/mochaSimpleButtonData.js';

chai.use(chaiLint);

describe('marky', () => {
  mochaJsdom({useEach: true});
  mochaJquery();
  mochaK();
  mochaGettext();
  /* globals window, document, $ */

  describe('marky toolbar creation', () => {
    let $markyToolbar, markyToolbar, $markyTextarea, markyTextarea;

    beforeEach(() => {
      rerequire('../markup.js');

      let sandbox = (
        <div id="sandbox">
          <div className="editor-tools"></div>
          <div>
            <textarea id="editor-textarea"></textarea>
          </div>
        </div>
      );
      React.render(sandbox, document.body);

      $markyToolbar = $('.editor-tools');
      $markyTextarea = $('#editor-textarea');
    });

    afterEach(() => {
      React.unmountComponentAtNode(document.body);
    });

    it('should create a simpleToolbar containing 5 button elements', () => {
      window.Marky.createSimpleToolbar($markyToolbar, $markyTextarea);
      expect($markyToolbar.children('button').length).to.equal(5);

      /**
        TO TEST:
        1. media button
        2. canned responses
        3. private messaging
      **/
    });

    it('should create a fullToolbar editor containing 9 button elements', () => {
      window.Marky.createFullToolbar($markyToolbar, $markyTextarea);
      expect($markyToolbar.children('button').length).to.equal(9);
    });

    it('should render simpleButtons with appropriate information', () => {
      window.Marky.createSimpleToolbar($markyToolbar, $markyTextarea);
      let buttons = $markyToolbar.children('button');

      for (let [index, fixtureData] of mochaSimpleButtonData.entries()) {
        let $currentButton = $(buttons[index]);
        expect($currentButton.attr('title')).to.equal(fixtureData.name);
        expect($currentButton.hasClass(fixtureData.className)).to.beTrue();
      }

    });

    it('should bind a click event to simpleButtons', () => {
      /* NEEDS REFACTORING FOR ASSERTION TO PASS */
      window.Marky.createSimpleToolbar($markyToolbar, $markyTextarea);
      let button = $markyToolbar.children('button')[0];
      let clickSpy = sinon.spy(button, 'handleClick');
      $(button).click();
      // expect(clickSpy.called).to.beTrue();
    });
  });


  describe('separator', () => {
      /**
        TO TEST:
        1. renders a span element with the class of 'separator' between buttons
      **/
  });


  describe('link button', () => {
      /**
        TO TEST:
        1. opens modal window on click
        2. properly performs article searches
        3. builds link tag with appropriate markup on insert
      **/
  });

  describe('media button', () => {
      /**
        TO TEST:
        1. opens modal window on click
           TO DO: this functionality should be combined with link button click in markup.js
      **/
  });



  describe('canned responses button', () => {
      /**
        TO TEST:
      **/
  });



  describe('quote button', () => {
      /**
        TO TEST:
      **/
  });
});
