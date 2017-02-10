'use strict';

module.exports = {
  getStartupData: function(req, reply){
    reply({
      name: 'Terry',
      age: 30
    })
  }
};
