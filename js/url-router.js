import fun_sign from "./signin.js";
import fun_signup from "./signup.js";
import fun_verfiy from "./verify.js";
import initResetPassword from "./reset_password.js";
import initTwoFA from "./twoFA.js";
import initProfile from "./profile.js";
import setup from "./edit.js";
import custom from "./custom.js";
import team from "./team.js";


// import initVerifying from "./verify.js";
// import initResetPassConfirm from "./verify.js";

document.addEventListener("click", (e) => {
  const { target } = e;
  if (!target.matches("a")) {
    return;
  }
  e.preventDefault();
  urlRoute();
});

const urlRoutes = {
  "/404": {
    template: "/templates/error/404/404.html",
    title: "",
    description: "",
  },
  "/register_invalid": {
    template: "/templates/error/error_signup/error_signup.html",
    title: "register_invalid",
    description: "",
  },
  "/sucess_register": {
    template: "/templates/sucess/signin_sucess.html",
    title: "sucess_register",
    description: "",
  },
  "/": {
    template: "/templates/signin/signin.html",
    title: "signin",
    description: "",
  },
  "/signin": {
    template: "/templates/signin/signin.html",
    title: "signin",
    description: "",
  },
  "/signup": {
    template: "/templates/signup/signup.html",
    title: "signup",
    description: "",
  },
  "/profile": {
    template: "/templates/profile/profile.html",
    title: "profile",
    description: "",
  },
  "/verify": {
    template: "/templates/verify/verify.html",
    title: "verify",
    description: "",
  },
  "/password_reset": {
    template: "/templates/rest_password/password_reset.html",
    title: "rest_password",
    description: "",
  },
  "/password_reset_confirm": {
    template: "/templates/rest_password/password_reset_confirm.html",
    title: "password_reset_confirm",
    description: "",
  },
  "/twofa": {
    template: "/templates/twoFA/twoFA.html",
    title: "twoFA",
    description: "",
  },
  "/edit": {
    template: "/templates/edit/edit.html",
    title: "edit",
    description: "",
  },
  "/home": {
    template: "/templates/home/home.html",
    title: "home",
    description: "",
  },
};

// const notAuthRoutes = {

// }

const urlRoute = (event) => {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  urlLocationHandler();
};

function check_authenticate() {
  return fetch("http://127.0.0.1:8000/check/", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      if (response.status === 200) {
        return "1";
      } else if (response.status === 203) return "2";
      else {
        if (response.status === 401) {
          return "0";
        }
      }
    })
    .catch((error) => {
      console.error("Request failed", error);
      return "0";
    });
}

// function handlurladress(location, checkurl) {
//   const list = [
//     "/signup",
//     "/signin",
//     "/verify",
//     "/password_reset",
//     "/password_reset_confirm",
//     "/register_invalid",
//     "/sucess_register",
//     "/",
//   ];
//   if (checkurl == true) {
//     if (list.includes(location)) {
//       return false;
//     }
//   } else {
//     if (list.includes(location) || location == "/twofa") {
//       return false;
//     }
//   }
//   return true;
// }

function isAuthenticatedRoute(location) {
  const list = [
    "/signup",
    "/signin",
    "/verify",
    "/password_reset",
    "/password_reset_confirm",
    "/register_invalid",
    "/sucess_register",
    "/",
    "/twofa",
  ];
  if (list.includes(location)) return false;
  return true;
}

function isAuthenticatedRouteTwFa(location) {
  const list = [
    "/signup",
    "/signin",
    "/password_reset",
    "/",
    "/twofa",
    "/password_reset",
    "/password_reset_confirm",
    "/register_invalid",
    "/sucess_register",
    "/verify",
  ];

  if (list.includes(location)) return true;
  return false;
}
function isNotAuthenticatedRoute(location) {
  const list = [
    "/signup",
    "/signin",
    "/password_reset",
    "/",
    "/password_reset",
    "/password_reset_confirm",
    "/register_invalid",
    "/sucess_register",
    "/verify",
  ];
  if (list.includes(location)) return true;
  return false;
}

/************************************************** INIT Route************************************************** */
const urlLocationHandler = async () => {
  let location = window.location.pathname.toLowerCase();
  const isAuthenticated = await check_authenticate();
  let route = urlRoutes[location] || urlRoutes["/404"];
//   if (location != "/password_reset_confirm") {
//     if (route !== urlRoutes["/404"]) {
//       if (isAuthenticated === "1") {
//         if (!isAuthenticatedRoute(location)) {
//           location = "/profile";
//         }
//       } else if (isAuthenticated === "2") {
//         if (!isAuthenticatedRouteTwFa(location)) {
//           location = "/twofa";
//         }
//       } else if (isAuthenticated === "0") {
//         if (!isNotAuthenticatedRoute(location)) {
//           location = "/signin";
//         }
//       }
//       history.pushState(null, null, location);
//     } else {
//       location = "/404";
//       history.pushState(null, null, location);
//     }
//     route = urlRoutes[location];
//   } else {
//     if (isAuthenticated === "1") {
//       route = urlRoutes["/profile"];
//       history.pushState(null, null, "/profile");
//     }
//   }
  /************************************************** ************************************************** */

  // let route = urlRoutes[location] || urlRoutes["/404"];
  // history.pushState(null, null, location);
  // alert(route.template);

  // if (isAuthenticated == "1") {
  //   if (handlurladress(location, false) == false) {
  //     history.pushState(null, null, "/profile");
  //     location = "/profile";
  //   }
  // } else if (isAuthenticated == "2") {
  //   if (handlurladress(location, false) == true) {
  //     location = "/twofa";
  //     history.pushState(null, null, location);
  //   }
  // } else {
  //   if (handlurladress(location, true) == true) {
  //     location = "/";
  //     history.pushState(null, null, location);
  //   }
  // }

  // alert(route);
  const html = await fetch(route.template).then((response) => response.text());
  //   console.log(urlRoutes[location]);
  const pageSelected = urlRoutes[location].template.split("/");
  // console.log(html);
  document.getElementById("content").innerHTML = html;

  if (pageSelected.at(-1) === "signin.html") {
    fun_sign.initSignIn();
  } else if (pageSelected.at(-1) === "signup.html") {
    fun_signup.initSignUp();
  } else if (pageSelected.at(-1) === "verify.html") {
    fun_verfiy.initVerifying();
  } else if (pageSelected.at(-1) === "password_reset.html") {
    initResetPassword();
  } else if (pageSelected.at(-1) === "password_reset_confirm.html") {
    fun_verfiy.initResetPassConfirm();
  } else if (pageSelected.at(-1) === "twoFA.html") {
    initTwoFA();
  } else if (pageSelected.at(-1) === "profile.html") {
	custom();
    initProfile();
  } else if (pageSelected.at(-1) === "edit.html") {
    setup();
  } 
  else if (pageSelected.at(-1) === "home.html") {
    custom();
	team();
  }
};

window.onpopstate = urlLocationHandler;

window.route = urlRoute;

urlLocationHandler();

export { urlLocationHandler };
