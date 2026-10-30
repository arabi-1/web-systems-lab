import assert from 'node:assert/strict';
import { test } from 'node:test';
import mongoose from 'mongoose';
import Category from '../src/models/Category.js';
import ServiceRequest from '../src/models/ServiceRequest.js';
import User from '../src/models/User.js';

const userId = new mongoose.Types.ObjectId();
const categoryId = new mongoose.Types.ObjectId();

test('Category accepts a valid document', () => {
  assert.equal(
    new Category({
      name: '  IT Support  ',
      description: 'Help with campus systems',
    }).validateSync(),
    undefined,
  );
});

test('Category requires name', () => {
  assert.ok(new Category().validateSync()?.errors.name);
});

test('Category rejects a too-short name', () => {
  assert.ok(new Category({ name: 'A' }).validateSync()?.errors.name);
});

test('Category trims name', () => {
  assert.equal(new Category({ name: '  Library  ' }).name, 'Library');
});

test('User accepts a valid document', () => {
  assert.equal(
    new User({ name: 'Sara Ahmed', email: 'sara@example.com' }).validateSync(),
    undefined,
  );
});

test('User requires name and email', () => {
  const errors = new User().validateSync().errors;

  assert.ok(errors.name);
  assert.ok(errors.email);
});

test('User rejects a bad email', () => {
  assert.ok(new User({ name: 'Sara Ahmed', email: 'not-an-email' }).validateSync()?.errors.email);
});

test('User lowercases uppercase email', () => {
  assert.equal(
    new User({ name: 'Sara Ahmed', email: 'SARA@EXAMPLE.COM' }).email,
    'sara@example.com',
  );
});

test('User defaults role to student', () => {
  assert.equal(new User({ name: 'Sara Ahmed', email: 'sara@example.com' }).role, 'student');
});

test('User rejects an invalid role', () => {
  assert.ok(
    new User({ name: 'Sara Ahmed', email: 'sara@example.com', role: 'guest' }).validateSync()
      ?.errors.role,
  );
});

test('ServiceRequest accepts a valid document', () => {
  assert.equal(
    new ServiceRequest({
      requester: userId,
      category: categoryId,
      description: 'The projector in room A-101 is not displaying the lecture.',
      status: 'Open',
    }).validateSync(),
    undefined,
  );
});

test('ServiceRequest requires requester, category, and description', () => {
  const errors = new ServiceRequest().validateSync().errors;

  assert.ok(errors.requester);
  assert.ok(errors.category);
  assert.ok(errors.description);
});

test('ServiceRequest rejects an invalid priority', () => {
  assert.ok(
    new ServiceRequest({
      requester: userId,
      category: categoryId,
      description: 'The projector is not displaying the lecture.',
      priority: 'urgent',
    }).validateSync()?.errors.priority,
  );
});

test('ServiceRequest rejects an invalid status', () => {
  assert.ok(
    new ServiceRequest({
      requester: userId,
      category: categoryId,
      description: 'The projector is not displaying the lecture.',
      status: 'Submitted',
    }).validateSync()?.errors.status,
  );
});

test('ServiceRequest rejects a too-short description', () => {
  assert.ok(
    new ServiceRequest({
      requester: userId,
      category: categoryId,
      description: 'Too short',
    }).validateSync()?.errors.description,
  );
});

test('ServiceRequest defaults priority and status', () => {
  const request = new ServiceRequest({
    requester: userId,
    category: categoryId,
    description: 'The projector is not displaying the lecture.',
  });

  assert.equal(request.priority, 'medium');
  assert.equal(request.status, 'Open');
});
