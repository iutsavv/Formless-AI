-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "currentJobTitle" TEXT,
    "currentCompany" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "githubUrl" TEXT,
    "workAuthorization" TEXT,
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "salaryExpectation" TEXT,
    "availableStartDate" TEXT,
    "degree" TEXT,
    "university" TEXT,
    "graduationYear" TEXT,
    "gpa" TEXT,
    "fieldOfStudy" TEXT,
    "yearsOfExperience" TEXT,
    "skills" TEXT,
    "summary" TEXT,
    "resumeFileName" TEXT,
    "resumeData" TEXT,
    "coverLetter" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnknownField" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldLabel" TEXT,
    "fieldType" TEXT NOT NULL,
    "placeholder" TEXT,
    "pageUrl" TEXT NOT NULL,
    "pageDomain" TEXT NOT NULL,
    "userValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnknownField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UnknownField_userId_fieldName_pageDomain_key" ON "UnknownField"("userId", "fieldName", "pageDomain");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnknownField" ADD CONSTRAINT "UnknownField_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
