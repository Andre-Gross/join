/**
 * Dynamically includes HTML content into elements with the `w3-include-html` attribute.
 * After inclusion, it fetches the user ID from `sessionStorage` and displays the user's initials.
 * If no user ID is found, it defaults to displaying "G" for Guest.
 *
 * @async
 * @function includeHTML
 * @returns {Promise<void>} Resolves after all HTML content is included and the profile icon is updated.
 */
async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");

  for (let element of includeElements) {
    let file = element.getAttribute("w3-include-html");
    try {
      let response = await fetch(file);
      if (response.ok) {
        element.innerHTML = await response.text();
      } else {
        element.innerHTML = "Page not found.";
      }
    } catch (error) {
      console.error("Error loading file:", file, error);
      element.innerHTML = "Page not found.";
    }
  }
  updateUserInitials();

  setupDropdown();
}

/**
 * Updates the profile icon with the user's initials or hides it if not logged in.
 */
function updateUserInitials() {
  let profileIcon = document.querySelector(".profile-icon-circle");
  let profileIconContainer = document.getElementById(
    "profile-icon-container"
  );

  if (!profileIcon || !profileIconContainer) return;

  let loggedInUser = sessionStorage.getItem("loggedInUser");

  if (!loggedInUser) {
    profileIconContainer.style.display = "none";
    return;
  }

  let name = "Guest";

  try {
    let user = JSON.parse(loggedInUser);
    if (user?.name) {
      name = user.name;
    }
  } catch (error) {
    console.error("Error parsing loggedInUser from sessionStorage:", error);
  }

  profileIconContainer.style.display = "flex";
  profileIcon.textContent = getInitialsFromName(name);
}

/**
 * Sets up the dropdown functionality for the profile icon.
 */
function setupDropdown() {
  let profileIconContainer = document.getElementById(
    "profile-icon-container"
  );
  let dropdownMenu = document.getElementById("dropdownMenu");

  if (!profileIconContainer || !dropdownMenu) return;

  profileIconContainer.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle("dm-hidden");
  });

  document.addEventListener("click", (event) => {
    if (!profileIconContainer.contains(event.target)) {
      dropdownMenu.classList.add("dm-hidden");
    }
  });
}

/**
 * Highlights the current navigation item based on the page URL.
 */
function highlightActiveNavItem() {
  let currentPage = getCurrentPage();
  let navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    let page = item.getAttribute("data-page");
    if (page === currentPage) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/**
 * Extracts the current page name from the URL.
 *
 * @returns {string} The current page name without file extension.
 */
function getCurrentPage() {
  let path = window.location.pathname;
  let fileName = path.substring(path.lastIndexOf("/") + 1);
  return fileName.replace(".html", "");
}

/**
 * Adds event listener to run after the DOM has fully loaded.
 * - Calls `includeHTML` to load additional HTML content.
 * - Calls `updateNavForAuth` to update the navigation based on authentication status.
 * - Calls `highlightActiveNavItem` to highlight the active navigation item.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await includeHTML();
  updateNavForAuth();
  highlightActiveNavItem();
});

/**
 * Logs out the current user by removing their information from sessionStorage.
 * After clearing the session data, it redirects the user to the 'index.html' page.
 */
function logOut() {
  sessionStorage.removeItem("loggedInUser");
  sessionStorage.removeItem("loggedInUserEmail");
  sessionStorage.removeItem("loggedInUserId");
  sessionStorage.removeItem("loggedInUserName");
  sessionStorage.removeItem("loggedInUserPassword");
  sessionStorage.removeItem("greetingAnimationShown");
  sessionStorage.removeItem("IsThisFirstTime_Log_From_LiveServer");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 50);
}

document.addEventListener("DOMContentLoaded", () => {
  let logoutButton = document.querySelector(".logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", logOut);
  }
});

/**
 * Hides all protected navigation items if no user is logged in,
 * and displays the login button instead. Guests are allowed.
 */
function updateNavForAuth() {
  let loggedInUser =
    localStorage.getItem("loggedInUser") ||
    sessionStorage.getItem("loggedInUser");

  let loginItem = document.getElementById("nav-login");
  let protectedNavItems = document.querySelectorAll(
    ".nav-item:not(#nav-login)"
  );

  if (!loggedInUser) {
    protectedNavItems.forEach((item) => (item.style.display = "none"));
    if (loginItem) loginItem.style.display = "flex";
    return;
  }

  try {
    let user = JSON.parse(loggedInUser);

    if (user.name) {
      protectedNavItems.forEach((item) => (item.style.display = "flex"));
      if (loginItem) loginItem.style.display = "none";
    }
  } catch (error) {
    protectedNavItems.forEach((item) => (item.style.display = "none"));
    if (loginItem) loginItem.style.display = "flex";
  }
}
