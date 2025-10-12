// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('eduwallet');

// Create application user
db.createUser({
  user: 'eduwallet_user',
  pwd: 'eduwallet_password',
  roles: [
    {
      role: 'readWrite',
      db: 'eduwallet'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password', 'firstName', 'lastName', 'dateOfBirth'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        firstName: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 50
        },
        lastName: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 50
        },
        role: {
          bsonType: 'string',
          enum: ['student', 'institution', 'admin', 'super_admin']
        }
      }
    }
  }
});

db.createCollection('institutions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'institutionId', 'email', 'type', 'level', 'country'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        institutionId: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 20
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        type: {
          bsonType: 'string',
          enum: ['university', 'college', 'school', 'training_center', 'online_platform', 'certification_body', 'government_agency', 'private_organization', 'other']
        },
        level: {
          bsonType: 'string',
          enum: ['primary', 'secondary', 'high_school', 'vocational', 'undergraduate', 'graduate', 'postgraduate', 'professional', 'all_levels']
        }
      }
    }
  }
});

db.createCollection('learnpasses', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tokenId', 'owner', 'studentId', 'name', 'email', 'institutionId', 'tokenURI', 'contractAddress', 'transactionHash', 'blockNumber'],
      properties: {
        tokenId: {
          bsonType: 'number'
        },
        studentId: {
          bsonType: 'string',
          minLength: 1
        },
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        status: {
          bsonType: 'string',
          enum: ['active', 'suspended', 'revoked', 'expired']
        }
      }
    }
  }
});

db.createCollection('certificates', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tokenId', 'certificateId', 'student', 'studentAddress', 'courseName', 'issuer', 'issuerName', 'issueDate', 'completionDate', 'gradeOrScore', 'tokenURI', 'certificateURI', 'contractAddress', 'transactionHash', 'blockNumber'],
      properties: {
        tokenId: {
          bsonType: 'number'
        },
        certificateId: {
          bsonType: 'string',
          minLength: 1
        },
        courseName: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        issuerName: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        gradeOrScore: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 10
        },
        status: {
          bsonType: 'string',
          enum: ['active', 'suspended', 'revoked', 'expired']
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ walletAddress: 1 }, { unique: true, sparse: true });
db.users.createIndex({ studentId: 1 }, { unique: true, sparse: true });
db.users.createIndex({ institutionId: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

db.institutions.createIndex({ name: 1 });
db.institutions.createIndex({ institutionId: 1 }, { unique: true });
db.institutions.createIndex({ email: 1 }, { unique: true });
db.institutions.createIndex({ walletAddress: 1 }, { unique: true, sparse: true });
db.institutions.createIndex({ type: 1 });
db.institutions.createIndex({ level: 1 });
db.institutions.createIndex({ country: 1 });
db.institutions.createIndex({ isVerified: 1 });
db.institutions.createIndex({ isActive: 1 });
db.institutions.createIndex({ createdAt: -1 });

db.learnpasses.createIndex({ tokenId: 1 }, { unique: true });
db.learnpasses.createIndex({ owner: 1 });
db.learnpasses.createIndex({ studentId: 1 });
db.learnpasses.createIndex({ institutionId: 1 });
db.learnpasses.createIndex({ contractAddress: 1 });
db.learnpasses.createIndex({ status: 1 });
db.learnpasses.createIndex({ isVerified: 1 });
db.learnpasses.createIndex({ createdAt: -1 });
db.learnpasses.createIndex({ lastUpdated: -1 });

db.certificates.createIndex({ tokenId: 1 }, { unique: true });
db.certificates.createIndex({ certificateId: 1 }, { unique: true });
db.certificates.createIndex({ student: 1 });
db.certificates.createIndex({ studentAddress: 1 });
db.certificates.createIndex({ issuer: 1 });
db.certificates.createIndex({ contractAddress: 1 });
db.certificates.createIndex({ status: 1 });
db.certificates.createIndex({ isVerified: 1 });
db.certificates.createIndex({ issueDate: -1 });
db.certificates.createIndex({ createdAt: -1 });

// Text indexes for search functionality
db.learnpasses.createIndex({
  name: 'text',
  email: 'text',
  studentId: 'text'
});

db.certificates.createIndex({
  courseName: 'text',
  courseDescription: 'text',
  issuerName: 'text',
  'skillsCovered.name': 'text'
});

db.institutions.createIndex({
  name: 'text',
  description: 'text'
});

print('MongoDB initialization completed successfully!');
