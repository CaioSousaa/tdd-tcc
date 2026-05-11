import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./page";
import axios from "../lib/axios";

jest.mock("../lib/axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("RF2 - Autenticação de Usuário (Frontend)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o formulário com os campos e-mail e senha", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("deve armazenar o token e redirecionar após login bem-sucedido", async () => {
    const fakeToken = "header.payload.signature";
    mockAxios.post.mockResolvedValueOnce({
      status: 200,
      data: { token: fakeToken, user: { id: "1", name: "João", email: "joao@email.com" } },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: "joao@email.com" } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith("/sessions", {
        email: "joao@email.com",
        password: "senha123",
      });
      expect(mockPush).toHaveBeenCalledWith("/tasks");
    });
  });

  it("deve exibir mensagem de erro para credenciais inválidas (401)", async () => {
    mockAxios.post.mockRejectedValueOnce({ response: { status: 401 } });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: "joao@email.com" } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: "errada" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/e-mail ou senha inválidos/i)).toBeInTheDocument();
    });
  });
});
