// *****************************************************************************
// Copyright (C) 2025 Quallaa AI
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import { test } from '../fixtures/electron-app';

test('Debug widget DOM visibility', async ({ page }) => {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(8000);

  // Check panel HTML content
  const leftPanelHTML = await page.locator('#theia-left-content-panel').innerHTML().catch(() => 'NOT FOUND');
  const rightPanelHTML = await page.locator('#theia-right-content-panel').innerHTML().catch(() => 'NOT FOUND');

  console.log('=== LEFT PANEL HTML (first 500 chars) ===');
  console.log(typeof leftPanelHTML === 'string' ? leftPanelHTML.substring(0, 500) : leftPanelHTML);

  console.log('\n=== RIGHT PANEL HTML (first 500 chars) ===');
  console.log(typeof rightPanelHTML === 'string' ? rightPanelHTML.substring(0, 500) : rightPanelHTML);

  // Check panel visibility states
  const panelStates = await page.evaluate(() => {
    const left = document.querySelector('#theia-left-content-panel') as HTMLElement;
    const right = document.querySelector('#theia-right-content-panel') as HTMLElement;
    const bottom = document.querySelector('#theia-bottom-content-panel') as HTMLElement;

    return {
      leftExists: !!left,
      leftDisplay: left ? getComputedStyle(left).display : 'N/A',
      leftVisible: left ? left.offsetParent !== null : false,
      leftHasCollapsedClass: left ? left.classList.contains('theia-mod-collapsed') : false,
      leftClasses: left ? left.className : 'N/A',
      rightExists: !!right,
      rightDisplay: right ? getComputedStyle(right).display : 'N/A',
      rightVisible: right ? right.offsetParent !== null : false,
      rightHasCollapsedClass: right ? right.classList.contains('theia-mod-collapsed') : false,
      rightClasses: right ? right.className : 'N/A',
      bottomExists: !!bottom,
      bottomDisplay: bottom ? getComputedStyle(bottom).display : 'N/A',
      bottomVisible: bottom ? bottom.offsetParent !== null : false,
    };
  });

  console.log('\n=== PANEL STATES ===');
  console.log(JSON.stringify(panelStates, null, 2));

  // Find all elements with widget/docs/chat in ID or class
  const widgetElements = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'));
    return allElements
      .filter(el => {
        const id = el.id || '';
        const className = el.className || '';
        return id.includes('widget') || id.includes('view') || id.includes('docs') || id.includes('chat') ||
               (typeof className === 'string' && (className.includes('widget') || className.includes('docs') || className.includes('chat')));
      })
      .map(el => ({
        tag: el.tagName,
        id: el.id || 'NO-ID',
        classes: typeof el.className === 'string' ? el.className : 'NO-CLASS',
        visible: (el as HTMLElement).offsetParent !== null,
        display: getComputedStyle(el as HTMLElement).display
      }));
  });

  console.log('\n=== WIDGET-RELATED ELEMENTS ===');
  console.log(JSON.stringify(widgetElements.slice(0, 20), null, 2));
});
