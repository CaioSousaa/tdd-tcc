import { render, screen, waitFor } from "@testing-library/react";
import axios from "../../lib/axios";
import TagsPage from "./page";

jest.mock("../../lib/axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockTags = [
  { id: "1", name: "Urgente", color: "#ff0000", owner: "userId", createdAt: new Date().toISOString() },
  { id: "2", name: "Melhoria", color: "#00ff00", owner: "userId", createdAt: new Date().toISOString() },
];

describe("RF6 - Listar Tags (Frontend)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir as tags do usuário após carregar", async () => {
    mockAxios.get.mockResolvedValueOnce({ status: 200, data: mockTags });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText("Urgente")).toBeInTheDocument();
      expect(screen.getByText("Melhoria")).toBeInTheDocument();
    });
  });

  it("deve chamar GET /tags ao montar o componente", async () => {
    mockAxios.get.mockResolvedValueOnce({ status: 200, data: [] });

    render(<TagsPage />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith("/tags");
    });
  });

  it("deve exibir mensagem quando não houver tags", async () => {
    mockAxios.get.mockResolvedValueOnce({ status: 200, data: [] });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText(/nenhuma tag cadastrada/i)).toBeInTheDocument();
    });
  });

  it("deve exibir feedback de carregamento antes da resposta chegar", () => {
    mockAxios.get.mockReturnValueOnce(new Promise(() => { }));

    render(<TagsPage />);

    expect(
      screen.getByRole("status") || screen.getByTestId("loading")
    ).toBeInTheDocument();
  });

  it("deve renderizar o botão Nova Tag", async () => {
    mockAxios.get.mockResolvedValueOnce({ status: 200, data: [] });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /nova tag/i })).toBeInTheDocument();
    });
  });

  it("deve redirecionar para / em erro 401", async () => {
    mockAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

    render(<TagsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
