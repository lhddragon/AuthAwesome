'use strict';

module.exports = {
  getStartupData: function(req, reply){
    reply({
      name: 'Tim',
      age: 30
    })
  }
};
