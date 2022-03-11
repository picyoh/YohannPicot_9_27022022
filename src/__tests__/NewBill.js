/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  beforeAll(() => {
    // mock LocalStorage
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "e@e",
      })
    );
  });

  describe("When I navigate to NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.classList.contains("active-icon")).toBeTruthy();
    });
    test("Then newBill form should be displayed", () => {
      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();
    });
  });

  describe("When I am on NewBill Page", () => {
    beforeAll(() => {
      document.body.innerHTML = NewBillUI();
    });

    describe("When I submit a text", () => {
      test("Then it should display an alert", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = mockStore;

        const newBillClass = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        jest.spyOn(window, "alert").mockImplementation(() => {});
        // upload a file
        const file = new File(["(⌐□_□)"], "chucknorris.txt", {
          type: "text/plain",
        });
        const fileInput = screen.getByTestId("file");
        const handleChangeFile = jest.fn(newBillClass.handleChangeFile);
        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(window.alert).toBeCalled();
      });
    });

    describe("When I submit an image", () => {
      test("Then file is updated", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = mockStore;

        const newBillClass = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });
        // upload a file
        const file = new File(["(⌐□_□)"], "chucknorris.png", {
          type: "image/png",
        });

        const fileInput = screen.getByTestId("file");

        const handleChangeFile = jest.fn(newBillClass.handleChangeFile);
        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(handleChangeFile).toHaveBeenCalled();
      });
    });

    describe("When I submit a completed bill", () => {
      test("Then a new bill is created on Bill page", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = mockStore;

        const newBillClass = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const handleSubmit = jest.fn(newBillClass.handleSubmit);
        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);

        await waitFor(() => screen.getByTestId("tbody"));
        const tbody = screen.getByTestId("tbody");
        expect(tbody).toBeTruthy();
      });
    });
    
  });
});
