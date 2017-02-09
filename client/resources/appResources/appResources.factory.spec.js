'use strict';

describe('Resource: StartupData', function () {

  // load the service's module
  beforeEach(module('app.resources'));

  // instantiate service
  var mockStartupData;
  // var requestHandler;
  var $httpBackend;

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');

    mockStartupData = $injector.get('StartupData');
    jasmine.getJSONFixtures().fixturesPath = 'base/mocks/mock-data';

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return and transform data for a resource', function() {
    // TODO: Retest this factory. Refactor changes rendered tests useless
    /*var result;
    requestHandler = $httpBackend.when('GET')
      .respond(getJSONFixture('mock-data.json'));
    result = mockStartupData.get();
    $httpBackend.flush();

    expect(result.startupData.name).toBe('Tim');
    */
  });
});
