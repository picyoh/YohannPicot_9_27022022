/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills page", ()=>{
    test("Then bills should be fetched from mock API GET", async()=>{
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(()=> screen.getByText('Mes notes de frais'))
      const content = screen.getByTestId('tbody')
      expect(content).toBeTruthy();
      const iconEye = await screen.getAllByTestId('icon-eye')
      const checkRows = iconEye.length === 4;
      expect(checkRows).toBeTruthy()

    })
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();

    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on newBill button", ()=>{
      test("Then I should navigate to newBill page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({data: bills})
        
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const billsClass = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })
        const btnNewBill = screen.getByTestId('btn-new-bill')
        const handleClickNewBill = jest.fn((e)=> billsClass.handleClickNewBill())
        btnNewBill.addEventListener('click', handleClickNewBill)
        fireEvent.click(btnNewBill)
        expect(handleClickNewBill).toHaveBeenCalled()
        const formNewBill = screen.getByTestId('form-new-bill')
        expect(formNewBill).toBeTruthy()
      })
    })

    describe("When I click on eye icon", ()=>{
      test("Then I should display a bill file", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({data: bills})
        
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const billsClass = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })
        const iconEye = screen.getAllByTestId('icon-eye')
        const handleClickIconEye = jest.fn((e)=> billsClass.handleClickIconEye)
        iconEye.forEach(icon => {
          icon.addEventListener('click', handleClickIconEye)
          fireEvent.click(icon)
        })
        expect(handleClickIconEye).toHaveBeenCalled()
        const modal = screen.getByTestId('modaleFileEmployee')
        expect(modal).toBeTruthy()
      })
    })
  })
})
