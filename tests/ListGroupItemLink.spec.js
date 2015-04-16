/* globals describe, it, assert, expect */

var React = require('react/addons');
var ListGroupItemLink = require('../src/ListGroupItemLink');
var Router = require('react-router');
var { Route, RouteHandler } = Router;
var { Foo, Bar } = require('./TestHandlers');
var TestLocation = require('react-router/lib/locations/TestLocation');
var { click } = React.addons.TestUtils.Simulate;

describe('A ListGroupItemLink', function () {
  describe('with params and a query', function () {
    it('knows how to make its href', function () {
      var ListGroupItemLinkHandler = React.createClass({
        render: function () {
          return <ListGroupItemLink to="foo" params={{bar: 'baz'}} query={{qux: 'quux'}}>ListGroupItemLink</ListGroupItemLink>;
        }
      });

      var routes = [
        <Route name="foo" path="foo/:bar" handler={Foo} />,
        <Route name="link" handler={ListGroupItemLinkHandler} />
      ];

      var div = document.createElement('div');
      var testLocation = new TestLocation();
      testLocation.history = ['/link'];

      Router.run(routes, testLocation, function (Handler) {
        React.render(<Handler/>, div, function () {
          var a = div.querySelector('a');
          expect(a.getAttribute('href')).to.equal('/foo/baz?qux=quux');
        });
      });
    });
  });

  describe('when its route is active', function () {
    it('has an active class name', function (done) {
      var ListGroupItemLinkHandler = React.createClass({
        render: function () {
          return (
            <div>
              <ListGroupItemLink
                to="foo"
                className="dontKillMe"
              >ListGroupItemLink</ListGroupItemLink>
              <RouteHandler/>
            </div>
          );
        }
      });

      var routes = (
        <Route path="/" handler={ListGroupItemLinkHandler}>
          <Route name="foo" handler={Foo} />
          <Route name="bar" handler={Bar} />
        </Route>
      );

      var div = document.createElement('div');
      var testLocation = new TestLocation();
      testLocation.history = ['/foo'];
      var steps = [];

      function assertActive () {
        var a = div.querySelector('a');
        expect(a.className.split(' ').sort().join(' ')).to.equal('active dontKillMe list-group-item');
      }

      function assertInactive () {
        var a = div.querySelector('a');
        expect(a.className).to.equal('dontKillMe list-group-item');
      }

      steps.push(() => {
        assertActive();
        testLocation.push('/bar');
      });

      steps.push(() => {
        assertInactive();
        testLocation.push('/foo');
      });

      steps.push(() => {
        assertActive();
        done();
      });

      Router.run(routes, testLocation, function (Handler) {
        React.render(<Handler/>, div, () => {
          steps.shift()();
        });
      });
    });
  });

  describe('when clicked', function () {
    it('calls a user defined click handler', function (done) {
      var ListGroupItemLinkHandler = React.createClass({
        handleClick: function (event) {
          assert.ok(true);
          done();
        },

        render: function () {
          return <ListGroupItemLink to="foo" onClick={this.handleClick}>ListGroupItemLink</ListGroupItemLink>;
        }
      });

      var routes = [
        <Route name="foo" handler={Foo} />,
        <Route name="link" handler={ListGroupItemLinkHandler} />
      ];
      var div = document.createElement('div');
      var testLocation = new TestLocation();
      testLocation.history = ['/link'];

      Router.run(routes, testLocation, function (Handler) {
        React.render(<Handler/>, div, function () {
          click(div.querySelector('a'));
        });
      });
    });

    it('transitions to the correct route', function (done) {
      var div = document.createElement('div');
      var testLocation = new TestLocation();
      testLocation.history = ['/link'];

      var ListGroupItemLinkHandler = React.createClass({
        handleClick: function () {
          // just here to make sure click handlers don't prevent it from happening
        },

        render: function () {
          return <ListGroupItemLink to="foo" onClick={this.handleClick}>ListGroupItemLink</ListGroupItemLink>;
        }
      });

      var routes = [
        <Route name="foo" handler={Foo} />,
        <Route name="link" handler={ListGroupItemLinkHandler} />
      ];

      var steps = [];

      steps.push(function () {
        click(div.querySelector('a'), {button: 0});
      });

      steps.push(function () {
        expect(div.innerHTML).to.match(/Foo/);
        done();
      });

      Router.run(routes, testLocation, function (Handler) {
        React.render(<Handler/>, div, function () {
          steps.shift()();
        });
      });
    });

  });

});
