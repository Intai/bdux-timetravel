import chai from 'chai';
import sinon from 'sinon';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { TimeTravel } from '../../src/components/timetravel-react';

const render = () => {
  let renderer = TestUtils.createRenderer();
  renderer.render(<TimeTravel />);
  return renderer.getRenderOutput();
};

describe('TimeTravel Component', () => {

  it('should wrap inside a container', () => {
    let output = render();
    chai.expect(output.props.className).to.contain('container');
  });

});
