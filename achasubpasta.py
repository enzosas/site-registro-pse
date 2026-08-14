from pathlib import Path

# Arquivo para testar quantas subpastas existem para cada escola do drive


def analisar_pastas_pet_pse():
    # Caminho da pasta base no mesmo diretório de execução do script
    pasta_base = Path(__file__).parent / "PET PSE"

    # Verificação básica de existência
    if not pasta_base.exists():
        print(
            f"❌ A pasta '{pasta_base.name}' não foi encontrada no diretório atual."
        )
        return

    if not pasta_base.is_dir():
        print(f"❌ '{pasta_base.name}' existe, mas não é um diretório.")
        return

    print("=" * 60)
    print(f"📂 Analisando diretório base: {pasta_base.name}")
    print(f"📍 Caminho completo: {pasta_base.resolve()}")
    print("=" * 60)

    # Coleta apenas as subpastas diretas (Nível 1)
    subpastas_nv1 = [p for p in pasta_base.iterdir() if p.is_dir()]

    if not subpastas_nv1:
        print("Nenhuma subpasta encontrada dentro de 'PET PSE'.")
        return

    total_com_aninhamento = 0

    for subpasta in sorted(subpastas_nv1):
        # Coleta as subpastas dentro da subpasta (Nível 2)
        subpastas_nv2 = [p for p in subpasta.iterdir() if p.is_dir()]

        print(f"\n📁 Subpasta de 1º Nível: {subpasta.name}")
        print(f"   ├─ Caminho: {subpasta}")

        if subpastas_nv2:
            total_com_aninhamento += 1
            print(
                f"   └─ ⚠️  Contém {len(subpastas_nv2)} subpasta(s) aninhada(s):"
            )
            for sub_nv2 in sorted(subpastas_nv2):
                print(f"       ├── 📂 {sub_nv2.name}")
                print(f"       │   └── Caminho: {sub_nv2}")
        else:
            print("   └─ ℹ️  Não contém subpastas internas.")

    # Resumo final
    print("\n" + "=" * 60)
    print("📊 RESUMO")
    print(f"• Total de subpastas avaliadas: {len(subpastas_nv1)}")
    print(f"• Subpastas com pastas internas: {total_com_aninhamento}")
    print("=" * 60)


if __name__ == "__main__":
    analisar_pastas_pet_pse()