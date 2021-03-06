/*jshint expr:true*/
/*global describe, it, before, beforeEach*/
'use strict';



var expect = require('chai').expect;
var Renter = require('../../app/models/renter');
var Room   = require('../../app/models/room');
var connect = require('../../app/lib/mongodb');
var Apartment;
var Mongo = require('mongodb');


describe('Apartment', function() {
	//before and beforeEach goes here
 	before(function(done) {
 	  connect('property-manager', function(){
 	  Apartment = require('../../app/models/apartment');
 	  done();
 	  });
 	});
 	
 	beforeEach(function(done){
 	  global.mongodb.collection('units').remove(function(){
 	    done();
 	  });
 	});


	describe('contructor', function() {
		it('should create an apartment with empty rooms and renters', function(){
			var apt = new Apartment('A1');

			expect(apt).to.be.instanceof(Apartment);
			expect(apt.name).to.equal('A1');
			expect(apt.rooms.length).to.equal(0);
			expect(apt.renters.length).to.equal(0);
		});
	});



	describe('#area', function(){
		it('should display the total area of all rooms in a given unit', function(){
			var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 30, 20),
			new Room('kitchen', 20, 20),
			new Room('bedroom', 10, 20),
			new Room('bathroom', 10, 10)
			];

			var area = apt.area();

			expect(area).to.equal(1300);
		});
	});



	describe('#cost', function(){
		it('should display the total cost of all rooms in a given unit', function(){
			var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 30, 20),
			new Room('kitchen', 20, 20),
			new Room('bedroom', 10, 20),
			new Room('bathroom', 10, 10)
			];

			var cost = apt.cost();
			
			expect(cost).to.equal(6500);
		});
	});



	describe('#bedrooms', function(){
		it('should display the total number of bedrooms in a unit', function(){
			var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 30, 20),
			new Room('kitchen', 20, 20),
			new Room('bedroom', 10, 20),
			new Room('bathroom', 10, 10)
			];

			var bedrooms = apt.bedrooms();
			
			expect(bedrooms).to.equal(2);
		});
	});
	


	describe('#isAvailable', function(){
		it('should display room available', function(){
			var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 30, 20),
			new Room('kitchen', 20, 20),
			new Room('bedroom', 10, 20),
			new Room('bathroom', 10, 10)
			];

			apt.renters = [
			new Renter('laura', '30', 'female', 'spartan' ),
			];

			var available= apt.isAvailable();
			
			expect(available).to.equal(true);
		});
		it('should display room not available', function(){
			var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 30, 20),
			new Room('kitchen', 20, 20),
			new Room('bedroom', 10, 20),
			new Room('bathroom', 10, 10)
			];

			apt.renters = [
			new Renter('laura', '30', 'female', 'spartan' ),
			new Renter('jack', '53', 'male', 'coder' ),
			];

			var available= apt.isAvailable();
			
			expect(available).to.equal(false);
		});
	});



	describe('#purgeEvicted', function(){
		it('should remove evicted renters', function(){
			var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 30, 20),
			new Room('kitchen', 20, 20),
			new Room('bedroom', 10, 20),
			new Room('bathroom', 10, 10)
			];

			apt.renters = [
			new Renter('laura', '30', 'female', 'spartan' ),
			];


			apt.renters[0].isEvicted = true; //.isEvicted = true;

			apt.purgeEvicted();
			
			expect(apt.renters.length).to.equal(0);
		});
	});


	describe('#collectRent', function(){
		it('should collect all rent from roommates with no evictions', function(){
			var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];


			apt.renters = [
			new Renter('laura', '20', 'female', 'social worker' ),
			new Renter('samantha', '32', 'female', 'coder' ),
			new Renter('seymour', '18', 'male', 'waiter' ),
			new Renter('dan', '20', 'male', 'spartan' ),
			];

			//Initiates to 2000 each, enough to succesfully pay rent.
			for(var i = 0; i < apt.renters.length; i++){
				apt.renters[i].cash = 2000;
			}

			apt.collectRent();

			expect(apt.renters.length).to.equal(4);
		});
		it('should collect all rent from roommates with 2 evictions', function(){
			var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];


			apt.renters = [
			new Renter('laura', '20', 'female', 'social worker' ),
			new Renter('samantha', '32', 'female', 'coder' ),
			new Renter('seymour', '18', 'male', 'waiter' ),
			new Renter('dan', '20', 'male', 'spartan' ),
			];

			apt.renters[0].cash = 2000;
			apt.renters[1].cash = 2000;
			apt.renters[2].cash = 0;
			apt.renters[3].cash = 0;

			
			apt.collectRent();

			expect(apt.renters.length).to.equal(2);
		});
	});


	describe('#save', function() {
		it('should update and existing item in the database', function(done){
      		var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

      		apt.save(function(){
      		  expect(apt._id).to.be.instanceof(Mongo.ObjectID);
      		  done();
      		}); 
		});
	});


	describe('.find', function() {
		it('should find all apartments in the database', function(done){
      		var apt = new Apartment('A1');
      		var apt2 = new Apartment('A2');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

			apt2.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

      		apt.save(function(){
      		  apt2.save(function(){
      		  	Apartment.find(function(apartments){
      		  		expect(apartments.length).to.equal(2);
      		  		done();
      		  	});
      		  });
      		}); 
		});
	});

	describe('.findByID', function() {
		it('should find a specific unit by ID', function(done){
      		var apt = new Apartment('A1');
      		var apt2 = new Apartment('A2');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

			apt2.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

      		apt.save(function(){
      		  apt2.save(function(){
      		  	//Turn into string due to data type differences
      		  	var _apt2ID = apt._id.toString();
      		  	Apartment.findByID(_apt2ID, function(unit, obj){
      		  		expect(_apt2ID).to.equal(unit);
      		  		expect(obj).to.be.instanceof(Apartment);
      		  		done();
      		  	});
      		  });
      		}); 
		});
	});

	describe('.deleteByID', function() {
		it('should delete a database entry by ID', function(done){
      		var apt = new Apartment('A1');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

      		  apt.save(function(){
      		  	Apartment.deleteByID(apt._id, function(){
      		  		Apartment.find(function(nothing){
      		  			expect(nothing.length).to.equal(0);
      		  			done();
      		  		});
      		  	});
      		});
      	}); 
	});

	describe('.area', function() {
		it('should display total area of entire complex', function(done){
      		var apt = new Apartment('A1');
      		var apt2 = new Apartment('A2');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

			apt2.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

			var area = apt.area() + apt2.area();

      		apt.save(function(){
      		  apt2.save(function(){

      		  	Apartment.area(function(overAll){
      		  		expect(overAll).to.equal(area);
      		  		done();
      		  	});
      		  });
      		}); 
		});
	});

	describe('.cost', function() {
		it('should display total cost of the entire complex', function(done){
      		var apt = new Apartment('A1');
      		var apt2 = new Apartment('A2');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

			apt2.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];

			var cost = apt.cost() + apt2.cost();

      		apt.save(function(){
      		  apt2.save(function(){
      		  	Apartment.cost(function(overCost){
      		  		expect(overCost).to.equal(cost);
      		  		done();
      		  	});
      		  });
      		}); 
		});
	});



	describe('.tenants', function(){
		it('should display total number of tenants', function(done){
			var apt = new Apartment('A1');
			var apt2 = new Apartment('A2');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];


			apt.renters = [
			new Renter('laura', '20', 'female', 'social worker' ),
			new Renter('samantha', '32', 'female', 'coder' ),
			new Renter('seymour', '18', 'male', 'waiter' ),
			new Renter('dan', '20', 'male', 'spartan' ),
			];

			apt2.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];


			apt2.renters = [
			new Renter('laura', '20', 'female', 'social worker' ),
			new Renter('samantha', '32', 'female', 'coder' ),
			new Renter('seymour', '18', 'male', 'waiter' ),
			new Renter('dan', '20', 'male', 'spartan' ),
			];

			//Number of tenant to test against
			var sumTenants = apt.renters.length + apt2.renters.length;


      		apt.save(function(){
      		  apt2.save(function(){
      		  	Apartment.tenants(function(tenants){
      		  		expect(tenants).to.equal(sumTenants);
      		  		done();
      		  	});
      		  });
      		}); 
		});
	});


describe('.revenue', function(){
		it('should display total revenue of the entire complex', function(done){
			var apt = new Apartment('A1');
			var apt2 = new Apartment('A2');

			apt.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];


			apt.renters = [
			new Renter('laura', '20', 'female', 'social worker' ),
			new Renter('samantha', '32', 'female', 'coder' ),
			new Renter('seymour', '18', 'male', 'waiter' ),
			new Renter('dan', '20', 'male', 'spartan' ),
			];

			apt2.rooms = [
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bedroom', 10, 10),
			new Room('bathroom', 5, 5),
			new Room('kitchen', 10, 5)
			];


			apt2.renters = [
			new Renter('laura', '20', 'female', 'social worker' ),
			new Renter('samantha', '32', 'female', 'coder' ),
			new Renter('seymour', '18', 'male', 'waiter' ),
			new Renter('dan', '20', 'male', 'spartan' ),
			];

			//Number of tenant to test against
			var sumRevenue = apt.cost() + apt2.cost();


      		apt.save(function(){
      		  apt2.save(function(){
      		  	Apartment.revenue(function(revenue){
      		  		expect(revenue).to.equal(sumRevenue);
      		  		done();
      		  	});
      		  });
      		}); 
		});
	});

describe('.revenue', function(){
		it('should not display total revenue', function(done){
			var apt = new Apartment('A1');
			var apt2 = new Apartment('A2');

			//Number of tenant to test against
			var sumRevenue = apt.cost() + apt2.cost();


      		apt.save(function(){
      		  apt2.save(function(){
      		  	Apartment.revenue(function(revenue){
      		  		expect(revenue).to.equal(0);
      		  		done();
      		  	});
      		  });
      		}); 
		});
	});
		
});