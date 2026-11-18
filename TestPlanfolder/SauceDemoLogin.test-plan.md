# SauceDemo Login Test Plan

## Application Overview

Test plan for the SauceDemo login page at https://www.saucedemo.com/. Assumes a fresh browser state for every scenario; valid users and the shared password are identified on the login page.

## Test Scenarios

### 1. Login

**Seed:** ``

#### 1.1. Standard user can log in successfully

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/ and confirm the Login form is displayed.
    - expect: The Username textbox, Password textbox, and Login button are visible.
  2. Enter standard_user in Username and secret_sauce in Password, then click Login.
    - expect: The page navigates to /inventory.html.
    - expect: The inventory heading or product inventory is visible.

#### 1.2. Locked-out user receives the expected login error

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/.
    - expect: The Login form is visible.
  2. Enter locked_out_user in Username and secret_sauce in Password, then click Login.
    - expect: The user remains on /.
    - expect: An error containing "Epic sadface: Sorry, this user has been locked out." is visible.

#### 1.3. Invalid username is rejected

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/.
    - expect: The Login form is visible.
  2. Enter not_a_user in Username and secret_sauce in Password, then click Login.
    - expect: The user remains on /.
    - expect: An error containing "Epic sadface: Username and password do not match any user in this service" is visible.

#### 1.4. Invalid password is rejected

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/.
    - expect: The Login form is visible.
  2. Enter standard_user in Username and wrong_password in Password, then click Login.
    - expect: The user remains on /.
    - expect: An error containing "Epic sadface: Username and password do not match any user in this service" is visible.

#### 1.5. Missing username is rejected

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/.
    - expect: The Login form is visible.
  2. Leave Username empty, enter secret_sauce in Password, then click Login.
    - expect: The user remains on /.
    - expect: An error containing "Epic sadface: Username is required" is visible.

#### 1.6. Missing password is rejected

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/.
    - expect: The Login form is visible.
  2. Enter standard_user in Username, leave Password empty, then click Login.
    - expect: The user remains on /.
    - expect: An error containing "Epic sadface: Password is required" is visible.

#### 1.7. Login can be submitted with Enter

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/.
    - expect: The Login form is visible.
  2. Enter standard_user in Username and secret_sauce in Password, then press Enter while the Password field is focused.
    - expect: The page navigates to /inventory.html.
    - expect: The inventory is visible.

#### 1.8. Password input remains masked

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/.
    - expect: The Login form is visible.
  2. Type secret_sauce into the Password field.
    - expect: The Password textbox has masked input behavior.
    - expect: The password text is not visibly exposed as entered.

#### 1.9. Login error can be dismissed

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Submit a login using locked_out_user and secret_sauce.
    - expect: The login error is visible.
  2. Click the error dismiss button.
    - expect: The error alert is no longer visible.
    - expect: The Username and Password fields remain available for correction.

#### 1.10. Displayed usernames and shared password support valid-account matrix

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/.
    - expect: Accepted usernames and the shared password secret_sauce are available in the on-page instructions.
  2. For problem_user, performance_glitch_user, error_user, and visual_user, enter that username and secret_sauce, then submit Login.
    - expect: Each account navigates to /inventory.html.
    - expect: The inventory page is visible after login.

#### 1.11. Successful login clears stale login errors

**File:** `TestPlanfolder/saucedemo-login.spec.ts`

**Steps:**
  1. Open https://www.saucedemo.com/.
    - expect: The Login form is visible.
  2. Submit a failed login with invalid credentials.
    - expect: A login error is visible.
  3. Enter standard_user and secret_sauce, then submit Login.
    - expect: The page navigates to /inventory.html.
    - expect: The inventory is visible and no login error remains.
