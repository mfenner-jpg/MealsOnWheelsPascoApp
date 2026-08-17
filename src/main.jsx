import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./index.css";

import App from "./App";
import AppShell from "./components/AppShell";
import GetMeals from "./pages/GetMeals";
import ArrangeHomeDelivery from "./pages/ArrangeHomeDelivery";
import WeeklyMenu from "./pages/WeeklyMenu";
import MealDeliveryFAQs from "./pages/MealDeliveryFAQs";
import DrupalConnectionTest from "./pages/DrupalConnectionTest";
import MealApplication from "./pages/MealApplication";
import MealApplicationConfirmation from "./pages/MealApplicationConfirmation";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<App />} />

          <Route
            path="/get-meals"
            element={<GetMeals />}
          />

          <Route
            path="/arrange-home-delivery"
            element={<ArrangeHomeDelivery />}
          />

          <Route
            path="/meal-application"
            element={<MealApplication />}
          />

          <Route
            path="/meal-application-confirmation"
            element={<MealApplicationConfirmation />}
          />

          <Route
            path="/weekly-menu"
            element={<WeeklyMenu />}
          />

          <Route
            path="/meal-delivery-faqs"
            element={<MealDeliveryFAQs />}
          />

          {/* TEMPORARY DRUPAL CONNECTION TEST */}
          <Route
            path="/drupal-connection-test"
            element={<DrupalConnectionTest />}
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  </React.StrictMode>
);