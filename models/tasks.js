var mysql = require('mysql');
var pool = require('../models/config.js');

var Tasks = {
	list: function(table, callback) {
	var sql = "SELECT * FROM ??";
	var inserts = [table];
	sql = mysql.format(sql, inserts);

	pool.getConnection(function(err, connection) {
		if(err)
			callback(err);
		else {
		connection.query( sql, function(err, rows) {
			if(err)
				callback(err);
			else
				callback(err, rows);
		connection.release();
		});
	}
	});
	},
	add: function(table, sets, callback) {
	var sql = "INSERT INTO ?? SET ?";
	var inserts = [table, sets];
	sql = mysql.format(sql, inserts);

	pool.getConnection(function(err, connection) {
		if(err)
			callback(err);
		else {
		connection.query( sql, function(err) {
			if(err)
				callback(err);
			else
				callback('added');
		connection.release();
		});
	}
	});
	},
	change: function(table, id, sets, callback) {
	var sql = "UPDATE ?? SET ? WHERE id = ?";
	var inserts = [table, sets, id];
	sql = mysql.format(sql, inserts);

	pool.getConnection(function(err, connection) {
		if(err)
			callback(err);
		else {
		connection.query( sql, function(err) {
			if(err)
				callback(err);
			else
				callback('changed');
		connection.release();
		});
	}
	});
	},
	complete: function(id, callback) {
	var sql = "UPDATE tasks SET done='1' WHERE id = ?";
	var inserts = [id];
	sql = mysql.format(sql, inserts);

	pool.getConnection(function(err, connection) {
		if(err)
			callback(err);
		else {
		connection.query( sql, function(err) {
			if(err)
				callback(err);
			else
				callback('changed');
		connection.release();
		});
	}
	});
	},
	delete: function(table, id, callback) {
	var sql = "DELETE FROM ?? WHERE id=?";
	var inserts = [table, id];
	sql = mysql.format(sql, inserts);

	pool.getConnection(function(err, connection) {
		if(err)
			callback(err);
		else {
		connection.query( sql, function(err) {
			if(err)
				callback(err);
			else
				callback('deleted');
		connection.release();
		});
	}
	});
	}
};

module.exports = Tasks;