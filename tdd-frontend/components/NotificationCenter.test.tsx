import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import axiosInstance from "@/lib/axios";
import NotificationCenter from "./NotificationCenter";

jest.mock("@/lib/axios");
jest.useFakeTimers();

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const makeNotifications = (overrides: object[] = []) =>
  overrides.map((o, i) => ({
    _id: `notif-${i}`,
    message: `Notificação ${i}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...o,
  }));

beforeEach(() => {
  jest.clearAllMocks();
  mockedAxios.get.mockResolvedValue({ data: [] });
});

afterAll(() => {
  jest.useRealTimers();
});

describe("RF14 - NotificationCenter (Frontend)", () => {
  it("renderiza o botão de sino", async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  it("chama GET /notifications ao montar o componente", async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/notifications");
    });
  });

  it("exibe badge com contagem de não lidas quando há notificações não lidas", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: makeNotifications([
        { _id: "n1", read: false },
        { _id: "n2", read: false },
        { _id: "n3", read: true },
      ]),
    });

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("não exibe badge quando todas as notificações estão lidas", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: makeNotifications([{ _id: "n1", read: true }]),
    });

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });
  });

  it("abre o dropdown com a lista de notificações ao clicar no sino", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: makeNotifications([{ _id: "n1", message: "Alerta urgente", read: false }]),
    });

    render(<NotificationCenter />);

    await waitFor(() => screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Alerta urgente")).toBeInTheDocument();
    });
  });

  it("exibe estado vazio quando não há notificações", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(<NotificationCenter />);

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText(/nenhuma notificação/i)).toBeInTheDocument();
    });
  });

  it("chama PUT /notifications/:id/read ao clicar em notificação não lida", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: makeNotifications([{ _id: "notif-x", message: "Clicar aqui", read: false }]),
    });
    mockedAxios.put.mockResolvedValueOnce({
      data: { _id: "notif-x", read: true },
    });

    render(<NotificationCenter />);

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => screen.getByText("Clicar aqui"));
    fireEvent.click(screen.getByText("Clicar aqui"));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "/notifications/notif-x/read",
        { read: true }
      );
    });
  });

  it("não chama PUT quando a notificação já está lida", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: makeNotifications([{ _id: "notif-y", message: "Já lida", read: true }]),
    });

    render(<NotificationCenter />);

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => screen.getByText("Já lida"));
    fireEvent.click(screen.getByText("Já lida"));

    await waitFor(() => {
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });
  });

  it("atualiza o estado local da notificação para read:true após marcar como lida", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: makeNotifications([{ _id: "notif-z", message: "Marcar lida", read: false }]),
    });
    mockedAxios.put.mockResolvedValueOnce({ data: { _id: "notif-z", read: true } });

    render(<NotificationCenter />);

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => screen.getByText("Marcar lida"));

    fireEvent.click(screen.getByText("Marcar lida"));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    // badge deve sumir após marcar como lida
    await waitFor(() => {
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });
  });
});
