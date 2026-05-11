import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "./page";
import axios from "../../lib/axios";

jest.mock("../../lib/axios");

const mockAxios = axios as jest.Mocked<typeof axios>;

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("RF1 - Cadastro de Usuário (Frontend)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o formulário com os campos nome, e-mail e senha", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cadastrar/i })).toBeInTheDocument();
  });

  it("deve redirecionar para /login após cadastro bem-sucedido", async () => {
    mockAxios.post.mockResolvedValueOnce({ status: 201, data: { id: "1", name: "João" } });

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "João Silva" } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: "joao@email.com" } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith("/users", {
        name: "João Silva",
        email: "joao@email.com",
        password: "senha123",
      });
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("deve exibir mensagem de erro quando o e-mail já estiver cadastrado (409)", async () => {
    mockAxios.post.mockRejectedValueOnce({ response: { status: 409 } });

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "João" } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: "joao@email.com" } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/e-mail já cadastrado/i)).toBeInTheDocument();
    });
  });

  it("deve exibir mensagem de erro para campos inválidos (400)", async () => {
    mockAxios.post.mockRejectedValueOnce({ response: { status: 400 } });

    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/campos inválidos/i)).toBeInTheDocument();
    });
  });
});
