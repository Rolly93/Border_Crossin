"""
Ya no es necesario: la migración corre al arrancar el backend (utility/schema_upgrade.py).
Se conserva solo para ejecutarla a mano si hace falta:  python -m scripts.migrate_units
"""

from database import engine
from utility.schema_upgrade import upgrade_unit_schema

if __name__ == "__main__":
    upgrade_unit_schema(engine)
    print("Migración de unidades aplicada.")
