import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "../lib/axios";
import EditTagModal from "./EditTagModal";

jest.mock("../lib/axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockTag = { id: "tag-1", name: "Original", color: "#ff0000" };

describe("RF5 - Editar e Excluir Tags (Frontend)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o modal com os campos preenchidos com os valores atuais da tag", () => {
    render(<EditTagModal tag={mockTag} onClose={jest.fn()} onSuccess={jest.fn()} />);

    expect(screen.getByLabelText(/nome/i)).toHaveValue("Original");
    expect(screen.getByLabelText(/cor/i)).toHaveValue("#ff0000");
  });

  it("deve chamar PUT /tags/:id com os dados atualizados ao submeter", async () => {
    mockAxios.put.mockResolvedValueOnce({
      status: 200,
      data: { id: "tag-1", name: "Editada", color: "#00ff00" },
    });

    const onSuccess = jest.fn();
    render(<EditTagModal tag={mockTag} onClose={jest.fn()} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Editada" } });
    fireEvent.change(screen.getByLabelText(/cor/i), { target: { value: "#00ff00" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith("/tags/tag-1", {
        name: "Editada",
        color: "#00ff00",
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("deve exibir mensagem de erro 403 ao tentar editar tag de outro usuário", async () => {
    mockAxios.put.mockRejectedValueOnce({ response: { status: 403 } });

    render(<EditTagModal tag={mockTag} onClose={jest.fn()} onSuccess={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText(/você não tem permissão para esta ação/i)).toBeInTheDocument();
    });
  });

  it("deve exibir mensagem de erro 404 quando a tag não for encontrada", async () => {
    mockAxios.put.mockRejectedValueOnce({ response: { status: 404 } });

    render(<EditTagModal tag={mockTag} onClose={jest.fn()} onSuccess={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText(/tag não encontrada/i)).toBeInTheDocument();
    });
  });

  it("deve redirecionar para /login em erro 401", async () => {
    mockAxios.put.mockRejectedValueOnce({ response: { status: 401 } });

    render(<EditTagModal tag={mockTag} onClose={jest.fn()} onSuccess={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("deve chamar DELETE /tags/:id ao clicar em excluir e invocar onSuccess", async () => {
    mockAxios.delete.mockResolvedValueOnce({ status: 204 });

    const onSuccess = jest.fn();
    render(<EditTagModal tag={mockTag} onClose={jest.fn()} onSuccess={onSuccess} />);

    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => {
      expect(mockAxios.delete).toHaveBeenCalledWith("/tags/tag-1");
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
