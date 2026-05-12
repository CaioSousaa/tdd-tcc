import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import SettingsPage from "./page";

jest.mock("@/lib/axios");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));
jest.mock("@/components/Header", () => () => <div data-testid="header-mock" />);

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockPush = jest.fn();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  jest.clearAllMocks();
  mockedAxios.get.mockResolvedValue({
    data: { id: "u1", name: "Caio Silva", email: "caio@test.com" },
  });
});

describe("RF15 - Página de Configurações (Frontend)", () => {
  it("chama GET /users/me ao montar para pré-preencher o formulário", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/users/me");
    });
  });

  it("pré-preenche o campo nome com o valor retornado da API", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Caio Silva")).toBeInTheDocument();
    });
  });

  it("renderiza campo de nome e campo de nova senha", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument();
    });
  });

  it("ao submeter apenas o nome, chama PATCH /users/me com { name }", async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      data: { id: "u1", name: "Novo Nome", email: "caio@test.com" },
    });

    render(<SettingsPage />);

    await waitFor(() => screen.getByDisplayValue("Caio Silva"));

    const nameInput = screen.getByLabelText(/nome/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Novo Nome");
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        "/users/me",
        expect.objectContaining({ name: "Novo Nome" })
      );
    });
  });

  it("ao submeter nova senha, chama PATCH /users/me com { password }", async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      data: { id: "u1", name: "Caio Silva", email: "caio@test.com" },
    });

    render(<SettingsPage />);

    await waitFor(() => screen.getByLabelText(/nova senha/i));

    await userEvent.type(screen.getByLabelText(/nova senha/i), "novaSenha123");
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        "/users/me",
        expect.objectContaining({ password: "novaSenha123" })
      );
    });
  });

  it("exibe mensagem de sucesso após atualização bem-sucedida", async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      data: { id: "u1", name: "Atualizado", email: "caio@test.com" },
    });

    render(<SettingsPage />);

    await waitFor(() => screen.getByLabelText(/nome/i));
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText(/salvo|atualizado|sucesso/i)).toBeInTheDocument();
    });
  });

  it("exibe mensagem de erro quando a API retornar falha", async () => {
    mockedAxios.patch.mockRejectedValueOnce({
      response: { status: 400, data: { error: "Body vazio" } },
    });

    render(<SettingsPage />);

    await waitFor(() => screen.getByLabelText(/nome/i));
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText(/erro|falha/i)).toBeInTheDocument();
    });
  });

  it("redireciona para / quando GET /users/me retorna 401", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
